import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useCuttinboard } from "../services";
import { DATABASE, FIRESTORE } from "../utils";
import { Message } from "./Message";
import { Attachment, Sender } from "./types";
import {
  endBefore,
  get,
  limitToLast,
  orderByChild,
  push,
  query,
  ref as RTDBRef,
  set,
} from "firebase/database";
import useListReducer from "./useMessagesReducer";
import { fromRef, ListenEvent } from "rxfire/database";
import { composeMessage } from "./composeMessage";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { merge } from "rxjs";
import { DebouncedFunc, throttle } from "lodash";
import { usePresence } from "./usePresence";

/**
 * The props for the Direct Messages context.
 */
export interface IMessagesContext {
  /**
   * A function that fetches previous messages from the current conversation.
   */
  fetchPreviousMessages: () => Promise<void>;
  throttledFetchMore: DebouncedFunc<() => Promise<void>>;
  /**
   * An array of `Message` objects representing all of the messages in the current conversation.
   */
  allMessages: Message[];
  /**
   * A boolean indicating whether there are no more messages to fetch in the current conversation.
   */
  hasNoMoreMessages: boolean;
  /**
   * A function that submits a new message to the current conversation.
   * @param messageText - The text of the message.
   * @param replyTargetMessage - The message that the new message is replying to, or null if it is not a reply.
   * @param attachment - An optional attachment for the message.
   * @returns A promise that resolves when the message has been submitted.
   */
  submitMessage: (
    messageText: string,
    replyTargetMessage: Message | null,
    uploadAttachment?: ((messageId: string) => Promise<Attachment>) | undefined
  ) => Promise<void>;
  /**
   * A function that returns the file path for a given attachment file name.
   * @param fileName - The name of the attachment file.
   * @returns The file path for the attachment.
   */
  getAttachmentFilePath: (fileName: string) => string;
}

export const MessagesContext = React.createContext<IMessagesContext>(
  {} as IMessagesContext
);

/**
 * A component that provides the Direct Messages context.
 */
export function MessagesProvider({
  children,
  chatId,
  type,
  LoadingRenderer,
  onNewMessage,
}: {
  /**
   * The children of the component.
   */
  children: ReactNode;
  /**
   * The ID of the chat that the context is for.
   */
  chatId: string;
  /**
   * The type of the chat that the context is for.
   */
  type: "dm" | "conversation";
  LoadingRenderer: ReactElement;
  onNewMessage?: (message: Message) => void;
}) {
  const { user } = useCuttinboard();
  const [messages, dispatch] = useListReducer();
  const [hasNoMoreMessages, setHasNoMoreMessages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatPath, setChatPath] = useState<string>();
  usePresence(
    chatId
      ? type === "dm"
        ? `dmInfo/${chatId}/membersList/${user.uid}`
        : `conversations/${globalThis.locationData.organizationId}/${globalThis.locationData.id}/${chatId}/access/members/${user.uid}`
      : null
  );

  useEffect(() => {
    if (!chatId) {
      return;
    }
    setLoading(true);
    const path =
      type === "dm"
        ? `directMessages/${chatId}`
        : `conversationMessages/${globalThis.locationData.organizationId}/${globalThis.locationData.id}/${chatId}`;

    const baseRef = RTDBRef(DATABASE, path);

    const realtimeQuery = query(
      baseRef,
      limitToLast(50),
      orderByChild("createdAt")
    );

    const deleted$ = fromRef(baseRef, ListenEvent.removed);

    const added$ = fromRef(realtimeQuery, ListenEvent.added);

    const updated$ = fromRef(realtimeQuery, ListenEvent.changed);

    const subscription = merge(deleted$, added$, updated$).subscribe(
      ({ event, snapshot }) => {
        const { key, ref } = snapshot;
        const message = snapshot.val();
        if (key === null) {
          return;
        }

        switch (event) {
          case ListenEvent.added:
            {
              const newMessageData = new Message(message, key, ref);
              dispatch({
                type: "ADD_MESSAGE",
                newMessageData,
              });
              if (onNewMessage) {
                onNewMessage(newMessageData);
              }
            }
            break;
          case ListenEvent.changed:
            dispatch({
              type: "UPDATE_MESSAGE",
              message: new Message(message, key, ref),
            });
            break;
          case ListenEvent.removed:
            dispatch({
              type: "REMOVE_MESSAGE",
              messageId: key,
            });
            break;
          default:
            break;
        }

        setTimeout(() => {
          setLoading(false);
        }, 250);
      }
    );

    setChatPath(path);

    return () => {
      subscription.unsubscribe();
      // Reset messages
      dispatch({ type: "RESET" });
      setHasNoMoreMessages(false);
    };
  }, [chatId, type]);

  const orderMessages = useMemo(() => {
    return messages.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
  }, [messages]);

  const fetchPreviousMessages = useCallback(async () => {
    // Return early if there are no more messages to fetch or if all messages have been fetched
    if (orderMessages.length === 0 || hasNoMoreMessages) {
      return;
    }

    // Get the first message in the message list
    const { createdAt, ...firstMessage } =
      orderMessages[orderMessages.length - 1];

    // Check if the first message is a system message with type "start"
    if (firstMessage.type === "system" && firstMessage.systemType === "start") {
      // Set the "noMoreMessages" flag to true to indicate that all messages have been fetched
      setHasNoMoreMessages(true);
      return;
    }

    // Query the database for older messages in the chat
    const chatsRef = query(
      RTDBRef(DATABASE, chatPath),
      orderByChild("createdAt"),
      endBefore(createdAt),
      limitToLast(50)
    );

    // Listen for the query results and append the older messages to the message list
    const oldMessagesSnapshot = await get(chatsRef);
    const oldMessages: Message[] = [];

    oldMessagesSnapshot.forEach((oldMessage) => {
      if (oldMessage.key !== null) {
        oldMessages.push(
          new Message(oldMessage.val(), oldMessage.key, oldMessage.ref)
        );
      }
    });

    dispatch({
      type: "APPEND_OLDER",
      oldMessages,
    });

    // If the number of messages returned is less than 20, then we know that all messages have been fetched
    if (oldMessages.length < 50) {
      setHasNoMoreMessages(true);
    }
  }, [hasNoMoreMessages, orderMessages, dispatch, chatPath]);

  const throttledFetchMore = useMemo(
    () => throttle(fetchPreviousMessages, 300),
    [fetchPreviousMessages]
  );

  const submitMessage = useCallback(
    async (
      messageText: string,
      replyTargetMessage: Message | null,
      uploadAttachment?: (messageId: string) => Promise<Attachment>
    ) => {
      if (!user.displayName) {
        throw new Error("User must have a display name to send messages");
      }

      // Create a new object to store the sender information
      const sender: Sender = {
        id: user.uid,
        name: user.displayName,
      };

      // Create a new object to store the message data
      const msg = composeMessage(sender, messageText, replyTargetMessage);

      if (type === "dm") {
        msg.seenBy = { [user.uid]: true };
      } else {
        msg.locationName = globalThis.locationData.name;
      }

      const reference = push(RTDBRef(DATABASE, chatPath));

      // Ensure that the key is set before uploading the attachment
      if (!reference.key) {
        throw new Error("Message ID must be set before uploading attachment");
      }

      // Check if there is an attachment
      if (uploadAttachment) {
        // Upload the attachment to the storage bucket
        const attachment = await uploadAttachment(reference.key);
        msg.type = "attachment";
        msg.attachment = attachment;

        // Use destructuring assignment to extract the mime type from the attachment object
        const { mimeType } = attachment;

        // Use a switch statement to determine the type of the message based on the attachment's mime type
        switch (true) {
          case mimeType.includes("image"):
            msg.contentType = "image";
            break;
          case mimeType.includes("video"):
            msg.contentType = "video";
            break;
          case mimeType.includes("audio"):
            msg.contentType = "audio";
            break;
          default:
            msg.contentType = "file";
            break;
        }
      }

      await set(reference, msg);
      if (type === "dm") {
        await updateDoc(doc(FIRESTORE, "DirectMessages", chatId), {
          recentMessage: serverTimestamp(),
        });
      }
    },
    [chatPath, type, chatId]
  );

  const getAttachmentFilePath = useCallback(
    (fileName: string) =>
      type === "dm"
        ? `directMessages/${chatId}/${fileName}`
        : `organizations/${globalThis.locationData.organizationId}/locations/${globalThis.locationData.id}/conversationMessages/${chatId}/${fileName}`,
    [chatId, type]
  );

  if (loading) {
    return LoadingRenderer;
  }

  return (
    <MessagesContext.Provider
      value={{
        fetchPreviousMessages,
        allMessages: orderMessages,
        hasNoMoreMessages,
        submitMessage,
        getAttachmentFilePath,
        throttledFetchMore,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}
