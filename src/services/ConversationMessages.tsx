import React, { ReactNode, useCallback, useContext } from "react";
import { Message } from "../models/chat/Message";
import { Sender } from "../models/chat/Sender";
import { useCuttinboard } from "./Cuttinboard";
import { Database } from "../firebase";
import { push, ref as RTDBRef } from "firebase/database";
import { useLocation } from "./Location";
import { composeMessage } from "./composeMessage";
import useBaseMessaging from "./useBaseMessaging";

interface ConversationMessagesContextProps {
  fetchOlderMessages: () => Promise<void>;
  allMessages: Message[];
  noMoreMessages: boolean;
  sendMessage: (
    messageTxt: string,
    replyTargetMessage: Message | null,
    attachment?: {
      downloadUrl: string;
      fileName: string;
      mimeType: string;
      storageSourcePath: string;
    }
  ) => Promise<void>;
  loading: boolean;
  error: Error;
  getAttachmentRefPath: (fileName: string) => string;
}

const ConversationMessagesContext =
  React.createContext<ConversationMessagesContextProps>(
    {} as ConversationMessagesContextProps
  );

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
      const sender: Sender = {
        id: user.uid,
        name: user.displayName,
      };

      const msg = composeMessage(sender, messageTxt, replyTargetMessage);
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

      try {
        await push(RTDBRef(Database, chatPath), msg);
      } catch (error) {
        throw error;
      }
    },
    [chatId]
  );

  /**
   * Generate the Full Path of the file in the Storage
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

export const useConversationMessages = () =>
  useContext(ConversationMessagesContext);
