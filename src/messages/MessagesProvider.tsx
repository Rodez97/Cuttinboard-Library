import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useCuttinboard } from "../cuttinboard";
import { DATABASE } from "../utils";
import {
  DataSnapshot,
  endBefore,
  get,
  limitToLast,
  orderByChild,
  push,
  query,
  off,
  onChildAdded as firebaseOnChildAdded,
  onChildChanged as firebaseOnChildChanged,
  onChildRemoved as firebaseOnChildRemoved,
  onValue as firebaseOnValue,
  ref as RTDBRef,
} from "firebase/database";
import { usePresence } from "./usePresence";
import { useChatPaths } from "./useChatPaths";
import { SubmitMessageParams } from "./types";
import {
  addMessageReactionThunk,
  addMessageThunk,
  appendOlder,
  deleteMessage,
  deleteMessageThunk,
  makeMessagesSelector,
  upsertMessage,
  useMessagesDispatch,
  makeMessagesLoadingSelector,
  makeMessagesErrorSelector,
  setMessagesLoading,
  setMessages,
  setMessagesError,
} from ".";
import { useAppSelector, useAppThunkDispatch } from "../reduxStore/utils";
import { selectLocation } from "../cuttinboardLocation";
import {
  IMessage,
  MessageProviderMessagingType,
} from "@cuttinboard-solutions/types-helpers";

const mapToAddMessageRaw = (snapshot: DataSnapshot): IMessage | null => {
  const { key, ref } = snapshot;
  const message = snapshot.val();
  if (key === null || message === null) {
    return null;
  }
  return {
    ...message,
    messageRefUrl: ref.toString(),
  };
};

/**
 * The props for the Direct Messages context.
 */
export interface IMessagesContext {
  fetchPreviousMessages: () => Promise<void>;
  messages: IMessage[];
  noMoreMessages: boolean;
  submitMessage: (params: SubmitMessageParams) => Promise<void>;
  getAttachmentFilePath: (fileName: string) => string;
  addMessageReaction: (message: IMessage, emoji?: string) => void;
  removeMessage: (message: IMessage) => void;
  error?: string | undefined;
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
  batchSize: number;
  initialLoadSize: number;
}) {
  const { user, onError } = useCuttinboard();
  const { messagesPath, usersPath, storagePath } = useChatPaths(messagingType);
  const messagesDispatch = useMessagesDispatch();
  const [noMoreMessages, setNoMoreMessages] = useState(false);
  const thunkDispatch = useAppThunkDispatch();
  const [messagesSelector, messagesLoadingSelector, messagesErrorSelector] =
    useMemo(
      () => [
        makeMessagesSelector(messagingType.chatId),
        makeMessagesLoadingSelector(messagingType.chatId),
        makeMessagesErrorSelector(messagingType.chatId),
      ],
      [messagingType.chatId]
    );
  const messages = useAppSelector(messagesSelector);
  const loading = useAppSelector(messagesLoadingSelector);
  const error = useAppSelector(messagesErrorSelector);
  const locations = useAppSelector(selectLocation);

  usePresence({ usersPath });

  const fetchPreviousMessages = useCallback(async () => {
    // Return early if there are no more messages to fetch or if all messages have been fetched
    if (messages.length === 0 || noMoreMessages) {
      return;
    }

    // Get the latest message in the message list
    const { createdAt, ...firstMessage } = messages[messages.length - 1];

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
    const oldMessages: IMessage[] = [];

    oldMessagesSnapshot.forEach((oldMessage) => {
      if (oldMessage.key !== null) {
        oldMessages.push({
          ...oldMessage.val(),
          id: oldMessage.key,
          messageRefUrl: oldMessage.ref.toString(),
        });
      }
    });

    if (oldMessages.length === 0) {
      setNoMoreMessages(true);
      return;
    }

    messagesDispatch(
      appendOlder({
        chatId: messagingType.chatId,
        messages: oldMessages,
      })
    );

    // If the number of messages returned is less than `batchSize`, then we know that all messages have been fetched
    if (oldMessages.length < batchSize) {
      setNoMoreMessages(true);
    }
  }, [
    messages,
    noMoreMessages,
    messagesPath,
    batchSize,
    messagesDispatch,
    messagingType.chatId,
  ]);

  useEffect(() => {
    messagesDispatch(
      setMessagesLoading({
        chatId: messagingType.chatId,
        loading: "pending",
      })
    );

    const baseRef = RTDBRef(DATABASE, messagesPath);

    const realtimeQuery = query(
      baseRef,
      limitToLast(initialLoadSize),
      orderByChild("createdAt")
    );

    const onChildAdded = (snapshot: DataSnapshot | null) => {
      if (!snapshot) {
        return;
      }
      const message = mapToAddMessageRaw(snapshot);
      if (message) {
        messagesDispatch(
          upsertMessage({
            chatId: messagingType.chatId,
            message,
          })
        );
      }
    };

    const onChildChanged = (snapshot: DataSnapshot | null) => {
      if (!snapshot) {
        return;
      }
      const message = mapToAddMessageRaw(snapshot);
      if (message) {
        messagesDispatch(
          upsertMessage({
            chatId: messagingType.chatId,
            message,
          })
        );
      }
    };

    const onChildRemoved = (snapshot: DataSnapshot | null) => {
      if (!snapshot) {
        return;
      }
      const messageId = snapshot.key;
      if (messageId) {
        messagesDispatch(
          deleteMessage({
            chatId: messagingType.chatId,
            messageId,
          })
        );
      }
    };

    const onMessagesError = (error: Error) => {
      messagesDispatch(
        setMessagesError({
          chatId: messagingType.chatId,
          error: error.message,
        })
      );
      onError(error);
    };

    const onValue = (messages: IMessage[]) => {
      messagesDispatch(
        setMessages({
          chatId: messagingType.chatId,
          messages,
        })
      );
    };

    let childAddedHandler: ReturnType<typeof firebaseOnChildAdded> | undefined;
    const onInitialLoad = (snapshot: DataSnapshot) => {
      const snapshotVal = snapshot.val();
      let childrenToProcess = snapshotVal
        ? Object.keys(snapshot.val()).length
        : 0;

      // If the list is empty then Initialize the hook and use the default `onChildAdded` behavior
      if (childrenToProcess === 0) {
        childAddedHandler = firebaseOnChildAdded(
          realtimeQuery,
          onChildAdded,
          onMessagesError
        );
        onValue([]);
      } else {
        // Otherwise, we load the first batch of children all to reduce re-renders
        const children: IMessage[] = [];

        const onChildAddedWithoutInitialLoad = (addedChild: DataSnapshot) => {
          if (childrenToProcess > 0) {
            childrenToProcess--;

            const child = mapToAddMessageRaw(addedChild);

            if (child) {
              children.push(child);
            }

            if (childrenToProcess === 0) {
              onValue(children);
            }

            return;
          }

          onChildAdded(addedChild);
        };

        childAddedHandler = firebaseOnChildAdded(
          realtimeQuery,
          onChildAddedWithoutInitialLoad,
          onMessagesError
        );
      }
    };

    firebaseOnValue(realtimeQuery, onInitialLoad, onMessagesError, {
      onlyOnce: true,
    });
    const childChangedHandler = firebaseOnChildChanged(
      baseRef,
      onChildChanged,
      onMessagesError
    );
    const childRemovedHandler = firebaseOnChildRemoved(
      baseRef,
      onChildRemoved,
      onMessagesError
    );

    return () => {
      off(realtimeQuery, "child_added", childAddedHandler);
      off(baseRef, "child_changed", childChangedHandler);
      off(baseRef, "child_removed", childRemovedHandler);
    };
  }, [messagesPath, initialLoadSize, messagingType, messagesDispatch, onError]);

  const submitMessage = useCallback(
    async ({ messageText, uploadAttachment }: SubmitMessageParams) => {
      if (!user.displayName) {
        throw new Error("User must have a display name to send messages");
      }

      const reference = push(RTDBRef(DATABASE, messagesPath));

      if (!reference.key) {
        throw new Error("Message ID must be defined");
      }

      // Create a new object to store the message data
      const msg: IMessage = {
        sender: {
          id: user.uid,
          name: user.displayName,
          avatar: user.photoURL,
        },
        createdAt: new Date().getTime(),
        id: reference.key,
        messageRefUrl: reference.ref.toString(),
      };

      if (messageText) {
        msg.text = messageText.trim();
      }

      if (messagingType.type === "conversation") {
        if (!locations) {
          throw new Error("Location data is not defined");
        }
        msg.locationName = locations.name;
      }

      if (uploadAttachment) {
        msg.image = uploadAttachment.image;
      }

      try {
        await thunkDispatch(
          addMessageThunk(
            messagingType.chatId,
            messagingType.type === "dm",
            msg,
            uploadAttachment
          )
        );
      } catch (error) {
        onError(error);
        throw error;
      }
    },
    [
      user.displayName,
      user.uid,
      user.photoURL,
      messagesPath,
      messagingType.type,
      messagingType.chatId,
      locations,
      thunkDispatch,
      onError,
    ]
  );

  const getAttachmentFilePath = useCallback(
    (fileName: string) => `${storagePath}/${fileName}`,
    [storagePath]
  );

  const addMessageReaction = useCallback(
    (message: IMessage, emoji?: string) => {
      thunkDispatch(
        addMessageReactionThunk(messagingType.chatId, message, emoji)
      ).catch(onError);
    },
    [thunkDispatch, messagingType.chatId, onError]
  );

  const removeMessage = useCallback(
    (message: IMessage) => {
      thunkDispatch(deleteMessageThunk(messagingType.chatId, message)).catch(
        onError
      );
    },
    [thunkDispatch, messagingType.chatId, onError]
  );

  if (loading) {
    return LoadingRenderer;
  }

  return (
    <MessagesContext.Provider
      value={{
        fetchPreviousMessages,
        noMoreMessages,
        submitMessage,
        getAttachmentFilePath,
        messages,
        addMessageReaction,
        removeMessage,
        error,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}
