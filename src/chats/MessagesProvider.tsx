import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useCuttinboard } from "../services";
import { DATABASE } from "../utils";
import { IMessage, Message } from "./Message";
import {
  endBefore,
  get,
  limitToLast,
  orderByChild,
  push,
  query,
  ref as RTDBRef,
} from "firebase/database";
import { useListReducer } from "./useMessagesReducer";
import { fromRef, ListenEvent, QueryChange } from "rxfire/database";
import { map, merge, tap } from "rxjs";
import { debounce, DebouncedFunc } from "lodash";
import { usePresence } from "./usePresence";
import { useChatPaths } from "./useChatPaths";
import {
  MessageProviderMessagingType,
  Sender,
  SubmitMessageParams,
} from "./types";

/**
 * The props for the Direct Messages context.
 */
export interface IMessagesContext {
  fetchPreviousMessages: () => Promise<void>;
  fetchPreviousMessagesWithDebounce: DebouncedFunc<() => Promise<void>>;
  sortedMessages: Message[];
  messages: Record<string, Message>;
  noMoreMessages: boolean;
  submitMessage: (params: SubmitMessageParams) => void;
  getAttachmentPath: (fileName: string) => string;
}

export const MessagesContext = React.createContext<IMessagesContext>(
  {} as IMessagesContext
);

/**
 * A component that provides the Direct Messages context.
 */
export function MessagesProvider({
  children,
  messagingType,
  LoadingRenderer,
  onNewMessage,
  batchSize = 12,
  initialLoadSize = 40,
}: {
  /**
   * The children of the component.
   */
  children: ReactNode;
  /**
   * The type of the chat that the context is for.
   */
  messagingType: MessageProviderMessagingType;
  LoadingRenderer: ReactElement;
  onNewMessage: (message: Message) => void;
  batchSize: number;
  initialLoadSize: number;
}) {
  const { user } = useCuttinboard();
  const { messagesPath, usersPath, storagePath } = useChatPaths({
    messagingType,
    user,
  });
  const [messages, dispatch] = useListReducer();
  const [noMoreMessages, setNoMoreMessages] = useState(false);
  const [loading, setLoading] = useState(true);

  usePresence({ usersPath });

  const sortedMessages = useMemo(
    () =>
      Object.values(messages).sort((a, b) => {
        return b.createdAt - a.createdAt;
      }),
    [messages]
  );

  const fetchPreviousMessages = useCallback(async () => {
    // Return early if there are no more messages to fetch or if all messages have been fetched
    if (sortedMessages.length === 0 || noMoreMessages) {
      return;
    }

    // Get the latest message in the message list
    const { createdAt, ...firstMessage } =
      sortedMessages[sortedMessages.length - 1];

    // Check if the latest message is a system message with type "start"
    if (firstMessage.systemType === "start") {
      // Set the "noMoreMessages" flag to true to indicate that all messages have been fetched
      setNoMoreMessages(true);
      return;
    }

    // Query the database for older messages in the chat
    const chatsRef = query(
      RTDBRef(DATABASE, messagesPath),
      orderByChild("createdAt"),
      endBefore(createdAt),
      limitToLast(batchSize)
    );

    // Listen for the query results and append the older messages to the message list
    const oldMessagesSnapshot = await get(chatsRef);
    const oldMessages: Record<string, Message> = {};

    oldMessagesSnapshot.forEach((oldMessage) => {
      if (oldMessage.key !== null) {
        oldMessages[oldMessage.key] = new Message(
          oldMessage.val(),
          oldMessage.key,
          oldMessage.ref
        );
      }
    });

    if (oldMessagesSnapshot.size === 0) {
      setNoMoreMessages(true);
      return;
    }

    dispatch({
      type: "append_older",
      oldMessages,
    });

    // If the number of messages returned is less than `batchSize`, then we know that all messages have been fetched
    if (oldMessagesSnapshot.size < batchSize) {
      setNoMoreMessages(true);
    }
  }, [noMoreMessages, sortedMessages, dispatch, messagesPath]);

  const fetchPreviousMessagesWithDebounce = useMemo(
    () => debounce(fetchPreviousMessages, 300),
    []
  );

  useEffect(() => {
    setLoading(true);

    const baseRef = RTDBRef(DATABASE, messagesPath);

    const realtimeQuery = query(
      baseRef,
      limitToLast(initialLoadSize),
      orderByChild("createdAt")
    );

    const mapToMessage = map<
      QueryChange,
      | {
          message: Message;
          event: ListenEvent.added | ListenEvent.changed;
        }
      | {
          messageId: string;
          event: ListenEvent.removed;
        }
      | null
    >(({ snapshot, event }) => {
      const { key, ref } = snapshot;
      const message = snapshot.val();
      if (key === null || message === null) {
        return null;
      }
      switch (event) {
        case ListenEvent.added:
        case ListenEvent.changed:
          return { message: new Message(message, key, ref), event };
        case ListenEvent.removed:
          return { messageId: key, event };
        default:
          return null;
      }
    });

    const deleted$ = fromRef(baseRef, ListenEvent.removed).pipe(mapToMessage);

    const added$ = fromRef(realtimeQuery, ListenEvent.added).pipe(
      mapToMessage,
      tap((AddedMessage) => {
        if (AddedMessage && AddedMessage.event === ListenEvent.added) {
          const { message } = AddedMessage;
          onNewMessage(message);
        }
      })
    );

    const updated$ = fromRef(realtimeQuery, ListenEvent.changed).pipe(
      mapToMessage
    );

    const subscription = merge(deleted$, added$, updated$).subscribe({
      next: (subData) => {
        loading && setLoading(false);
        if (subData === null) {
          return;
        }

        const { event } = subData;

        switch (event) {
          case ListenEvent.added:
          case ListenEvent.changed:
            {
              dispatch({
                type: event,
                message: subData.message,
              });
            }
            break;
          case ListenEvent.removed:
            {
              dispatch({
                type: event,
                messageId: subData.messageId,
              });
            }
            break;
          default:
            break;
        }
      },
      error: (error) => {
        loading && setLoading(false);
        console.error(error);
      },
    });

    return () => {
      subscription.unsubscribe();
      // Reset messages
      dispatch({ type: "reset" });
      setNoMoreMessages(false);
      fetchPreviousMessagesWithDebounce.cancel();
    };
  }, [messagesPath]);

  const submitMessage = useCallback(
    ({
      messageText,
      replyTargetMessage,
      uploadAttachment,
    }: SubmitMessageParams) => {
      if (!user.displayName) {
        throw new Error("User must have a display name to send messages");
      }

      // Create a new object to store the sender information
      const sender: Sender = {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL,
      };

      // Create a new object to store the message data
      const msg: IMessage = {
        sender,
        text: messageText && messageText.trim(),
        createdAt: new Date().getTime(),
        replyTarget:
          replyTargetMessage && replyTargetMessage.toReplyData
            ? replyTargetMessage.toReplyData
            : undefined,
      };

      if (messagingType.type === "dm") {
        msg.seenBy = { [user.uid]: true };
      } else {
        if (!globalThis.locationData) {
          throw new Error("Location data is not defined");
        }
        msg.locationName = globalThis.locationData.name;
      }

      const reference = push(RTDBRef(DATABASE, messagesPath));

      // Ensure that the key is set before uploading the attachment
      if (!reference.key) {
        throw new Error("Message ID must be set before uploading attachment");
      }

      const message = new Message(
        msg,
        reference.key,
        reference.ref,
        messagingType.type === "dm"
          ? {
              uploadAttachment,
              isDM: true,
              dmId: messagingType.chatId,
            }
          : {
              uploadAttachment,
              isDM: false,
            }
      );

      dispatch({
        type: ListenEvent.added,
        message,
      });
    },
    [user, messagingType, messagesPath, dispatch]
  );

  const getAttachmentFilePath = useCallback(
    (fileName: string) => `${storagePath}/${fileName}`,
    [storagePath]
  );

  if (loading) {
    return LoadingRenderer;
  }

  return (
    <MessagesContext.Provider
      value={{
        fetchPreviousMessages,
        sortedMessages,
        noMoreMessages,
        submitMessage,
        getAttachmentPath: getAttachmentFilePath,
        fetchPreviousMessagesWithDebounce,
        messages,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}
