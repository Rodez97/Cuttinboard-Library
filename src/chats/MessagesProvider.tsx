import React, { ReactNode } from "react";
import { Message } from "./Message";
import { Attachment } from "./types";
import useBaseMessaging from "./useBaseMessaging";

/**
 * The props for the Direct Messages context.
 */
export interface IMessagesContext {
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
}) {
  const {
    messages,
    hasNoMoreMessages,
    fetchPreviousMessages,
    allMessages,
    submitMessage,
    getAttachmentFilePath,
  } = useBaseMessaging(chatId, type);

  return (
    <MessagesContext.Provider
      value={{
        fetchPreviousMessages,
        allMessages,
        hasNoMoreMessages,
        submitMessage,
        isLoading: messages.loading,
        error: messages.error,
        getAttachmentFilePath,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}
