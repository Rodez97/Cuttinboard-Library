import React, { ReactNode, useCallback, useContext } from "react";
import { Message } from "../models/chat/Message";
import { Sender } from "../models/chat/Sender";
import { useCuttinboard } from "./Cuttinboard";
import { Database, Firestore } from "../firebase";
import { push, ref as RTDBRef } from "firebase/database";
import {
  doc,
  updateDoc,
  serverTimestamp as FirestoreServerTimestamp,
} from "firebase/firestore";
import { composeMessage } from "./composeMessage";
import useBaseMessaging from "./useBaseMessaging";
import { Attachment } from "../models";

/**
 * The props for the Direct Messages context.
 */
export interface IDirectMessagesContextProps {
  /**
   * A function that fetches previous messages from the current conversation.
   */
  fetchPreviousMessages: () => Promise<void>;
  /**
   * An array of `Message` objects representing all of the messages in the current conversation.
   */
  allMessages?: Message[];
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
    attachment?: Attachment
  ) => Promise<void>;
  /**
   * A boolean indicating whether the context is currently loading data.
   */
  isLoading: boolean;
  /**
   * An optional error that occurred during a previous operation in the context.
   */
  error?: Error;
  /**
   * A function that returns the file path for a given attachment file name.
   * @param fileName - The name of the attachment file.
   * @returns The file path for the attachment.
   */
  getAttachmentFilePath: (fileName: string) => string;
}

const DirectMessagesContext = React.createContext<IDirectMessagesContextProps>(
  {} as IDirectMessagesContextProps
);

/**
 * A component that provides the Direct Messages context.
 */
export function DirectMessagesProvider({
  children,
  chatId,
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
   * The IDs of the users that are in the chat.
   */
  members: string[];
}) {
  const { user } = useCuttinboard();
  const {
    chatPath,
    messages,
    noMoreMessages,
    fetchOlderMessages,
    allMessages,
  } = useBaseMessaging(`directMessages/${chatId}`);

  const submitMessage = useCallback(
    async (
      messageTxt: string,
      replyTargetMessage: Message | null,
      attachment?: Attachment
    ) => {
      if (!user || !user.displayName) {
        throw new Error("User is not logged in");
      }
      const sender: Sender = {
        id: user.uid,
        name: user.displayName,
      };

      const msg = {
        ...composeMessage(sender, messageTxt, replyTargetMessage ?? undefined),
        seenBy: { [user.uid]: true },
      };

      if (attachment) {
        const { uri, fileName, mimeType, storageSourcePath } = attachment;
        msg.type = "attachment";
        if (mimeType.includes("image")) {
          msg.contentType = "image";
        } else if (mimeType.includes("video")) {
          msg.contentType = "video";
        } else if (mimeType.includes("audio")) {
          msg.contentType = "audio";
        } else {
          msg.contentType = "file";
        }
        msg.attachment = {
          mimeType,
          fileName,
          storageSourcePath,
          uri,
        };
      }

      await push(RTDBRef(Database, chatPath), msg);
      await updateDoc(doc(Firestore, "DirectMessage", chatId), {
        recentMessage: FirestoreServerTimestamp(),
      });
    },
    [chatId]
  );

  /**
   * Generate the Full Path of the file in the Storage
   */
  const getAttachmentRefPath = useCallback(
    (fileName: string) => `directMessages/${chatId}/${fileName}`,
    [chatId]
  );

  return (
    <DirectMessagesContext.Provider
      value={{
        fetchPreviousMessages: fetchOlderMessages,
        allMessages,
        hasNoMoreMessages: noMoreMessages,
        submitMessage,
        isLoading: messages.loading,
        error: messages.error,
        getAttachmentFilePath: getAttachmentRefPath,
      }}
    >
      {children}
    </DirectMessagesContext.Provider>
  );
}

export const useDirectMessages = () => useContext(DirectMessagesContext);
