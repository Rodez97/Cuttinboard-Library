import React, { ReactNode, useCallback, useContext } from "react";
import { Message } from "../models/chat/Message";
import { Sender } from "../models/chat/Sender";
import { useCuttinboard } from "./Cuttinboard";
import { Database } from "../firebase";
import { push, ref as RTDBRef } from "firebase/database";
import { useLocation } from "./Location";
import { composeMessage } from "./composeMessage";
import useBaseMessaging from "./useBaseMessaging";

export interface IConversationMessagesContextProps {
  /**
   * A function that fetches older messages in a conversation. This function returns a `Promise` that resolves when the older messages have been fetched.
   */
  fetchOlderMessages: () => Promise<void>;
  /**
   * An array of `Message` objects representing all of the messages in a conversation.
   */
  allMessages: Message[];
  /**
   * A boolean value indicating whether there are no more older messages to be fetched in the conversation.
   */
  noMoreMessages: boolean;
  /**
   * A function that sends a message to a conversation. This function returns a `Promise` that resolves when the message has been sent.
   * @param messageTxt The text of the message to be sent.
   * @param replyTargetMessage The `Message` object that the new message is replying to, or `null` if the message is not a reply.
   * @param attachment An optional object containing information about a file attachment for the message. This object has the following properties:
   * @param attachment.downloadUrl The URL where the attachment can be downloaded.
   * @param attachment.fileName The name of the file attachment.
   * @param attachment.mimeType The MIME type of the file attachment.
   * @param attachment.storageSourcePath The storage path of the file attachment.
   */
  sendMessage: (
    /**
     * The text of the message to be sent.
     */
    messageTxt: string,
    /**
     * The `Message` object that the new message is replying to, or `null` if the message is not a reply.
     */
    replyTargetMessage: Message | null,
    /**
     * An optional object containing information about a file attachment for the message. This object has the following properties:
     */
    attachment?: {
      /**
       * The URL where the attachment can be downloaded.
       */
      downloadUrl: string;
      /**
       * The name of the file attachment.
       */
      fileName: string;
      /**
       * The MIME type of the file attachment.
       */
      mimeType: string;
      /**
       * The storage path of the file attachment.
       */
      storageSourcePath: string;
    }
  ) => Promise<void>;
  /**
   * A boolean value indicating whether the context is currently loading data.
   */
  loading: boolean;
  /**
   * An optional `Error` object containing information about an error that occurred while loading data for the context.
   */
  error?: Error;
  /**
   * A function that returns the storage reference path for a file attachment. This function takes a `fileName` argument and returns a string representing the storage reference path for the attachment.
   */
  getAttachmentRefPath: (fileName: string) => string;
}

const ConversationMessagesContext =
  React.createContext<IConversationMessagesContextProps>(
    {} as IConversationMessagesContextProps
  );

/**
 * Is used to provide data and functions related to conversation messages in a React application
 * @param children React element or node that represents the content to be rendered within the provider.
 * @param chatId A string representing the ID of the chat for which the provider should provide data and functions.
 * @returns returns a component that provides the data and functions defined in the provider to its children. This allows the provider's data and functions to be accessed by the components that are rendered within the provider.
 */
export function ConversationMessagesProvider({
  children,
  chatId,
}: {
  children: ReactNode;
  chatId: string;
}) {
  const { user } = useCuttinboard();
  const { location } = useLocation();
  const {
    chatPath,
    messages,
    noMoreMessages,
    fetchOlderMessages,
    allMessages,
  } = useBaseMessaging(
    `conversationMessages/${location.organizationId}/${location.id}/${chatId}`
  );

  /**
   * {@inheritDoc IConversationMessagesContextProps.sendMessage}
   */
  const sendMessage = useCallback(
    async (
      messageTxt: string,
      replyTargetMessage: Message | null,
      attachment?: {
        downloadUrl: string;
        fileName: string;
        mimeType: string;
        storageSourcePath: string;
      }
    ) => {
      if (!user || !user.displayName) {
        throw new Error("No user");
      }
      const sender: Sender = {
        id: user.uid,
        name: user.displayName,
      };

      const msg = composeMessage(
        sender,
        messageTxt,
        replyTargetMessage ?? undefined
      );
      msg.locationName = location.name;

      if (attachment) {
        const { downloadUrl, fileName, mimeType, storageSourcePath } =
          attachment;
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
          uri: downloadUrl,
        };
      }

      await push(RTDBRef(Database, chatPath), msg);
    },
    [chatId]
  );

  /**
   * {@inheritDoc IConversationMessagesContextProps.getAttachmentRefPath}
   */
  const getAttachmentRefPath = useCallback(
    (fileName: string) =>
      `organizations/${location.organizationId}/locations/${location.id}/conversationMessages/${chatId}/${fileName}`,
    [chatId, location]
  );

  return (
    <ConversationMessagesContext.Provider
      value={{
        fetchOlderMessages,
        allMessages,
        noMoreMessages,
        sendMessage,
        loading: messages.loading,
        error: messages.error,
        getAttachmentRefPath,
      }}
    >
      {children}
    </ConversationMessagesContext.Provider>
  );
}

/**
 * A custom React hook that provides access to the data and functions
 * from the `ConversationMessagesProvider` component.
 *
 * This hook returns an object that has the same shape as the
 * `IConversationMessagesContextProps` interface.
 *
 * {@link IConversationMessagesContextProps}
 */
export const useConversationMessages = () => {
  const context = useContext(ConversationMessagesContext);

  if (context === undefined) {
    throw new Error(
      "useConversationMessages must be used within a ConversationMessagesProvider"
    );
  }

  return context;
};
