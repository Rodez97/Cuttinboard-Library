import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { findIndex, isEmpty } from "lodash";
import React, { ReactNode, useCallback, useContext } from "react";
import { Message } from "../models/chat/Message";
import { Sender } from "../models/chat/Sender";
import { useCuttinboard } from "./Cuttinboard";
import { Database, Storage } from "../firebase";
import {
  push,
  ref as RTDBRef,
  remove,
  serverTimestamp,
  set,
} from "firebase/database";
import { useLocation } from "./Location";
import { composeMessage } from "./composeMessage";
import { Attachment } from "models";
import useBaseMessaging from "./useBaseMessaging";

interface ConversationMessagesContextProps {
  fetchOlderMessages: () => Promise<void>;
  allMessages: Message[];
  noMoreMessages: boolean;
  sendMessage: (
    messageTxt: string,
    replyTargetMessage?: Message & {
      type: "attachment" | "youtube" | "mediaUri" | "text";
    }
  ) => Promise<void>;
  attachFiles: (
    file: File | Blob | Uint8Array | ArrayBuffer,
    fileName: string,
    mimeType: string,
    message: string | null,
    replyTargetMessage?: Message & {
      type: "attachment" | "youtube" | "mediaUri" | "text";
    }
  ) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  loading: boolean;
  error: Error;
  addReaction: (messageId: string, emoji?: string) => Promise<void>;
}

const ConversationMessagesContext =
  React.createContext<ConversationMessagesContextProps>(
    {} as ConversationMessagesContextProps
  );

export function ConversationMessagesProvider({
  children,
  chatId,
  members,
}: {
  children: ReactNode;
  chatId: string;
  members: string[];
}) {
  const { user } = useCuttinboard();
  const { location, locationId } = useLocation();
  const {
    chatPath,
    messages,
    dispatch,
    noMoreMessages,
    fetchOlderMessages,
    allMessages,
    addReaction,
    deleteMessage,
  } = useBaseMessaging(
    `conversationMessages/${location.organizationId}/${locationId}/${chatId}`
  );

  const sendMessage = useCallback(
    async (
      messageTxt: string,
      replyTargetMessage?: Message & {
        type: "attachment" | "youtube" | "mediaUri" | "text";
      }
    ) => {
      const sender: Sender = {
        id: user.uid,
        name: user.displayName,
      };

      const msg = composeMessage(sender, messageTxt, replyTargetMessage);
      msg.locationName = location.name;

      try {
        await push(RTDBRef(Database, chatPath), msg);
      } catch (error) {
        throw error;
      }
    },
    [chatId]
  );

  const attachFiles = useCallback(
    async (
      file: File | Blob | Uint8Array | ArrayBuffer,
      fileName: string,
      mimeType: string,
      message: string | null,
      replyTargetMessage?: Message & {
        type: "attachment" | "youtube" | "mediaUri" | "text";
      }
    ) => {
      const sender: Sender = {
        id: user.uid,
        name: user.displayName,
      };

      const fileRef = ref(
        Storage,
        `organizations/${location.organizationId}/locations/${locationId}/conversationMessages/${chatId}/${fileName}`
      );

      const msg: Partial<Message<object> & { type: "attachment" }> = {
        type: "attachment",
        sender,
        createdAt: serverTimestamp(),
        locationName: location.name,
      };

      if (replyTargetMessage) {
        const { replyTarget, ...others } = replyTargetMessage;
        msg.replyTarget = others;
      }

      if (mimeType.includes("image")) {
        msg.contentType = "image";
        msg.message = "🖼️ Image Message";
      } else if (mimeType.includes("video")) {
        msg.contentType = "video";
        msg.message = "🎞️ Video Message";
      } else if (mimeType.includes("audio")) {
        msg.contentType = "audio";
        msg.message = "🎵 Audio Message";
      } else {
        msg.contentType = "file";
        msg.message = "📁 File Message";
      }
      if (message) {
        msg.message = message;
      }
      try {
        await uploadBytes(fileRef, file);

        const attachment: Attachment = {
          mimeType,
          storageSourcePath: fileRef.fullPath,
          fileName: fileName,
          uri: await getDownloadURL(fileRef),
        };

        msg.attachment = attachment;

        await push(RTDBRef(Database, chatPath), msg);
      } catch (error) {
        throw error;
      }
    },
    [chatId, location.organizationId]
  );

  return (
    <ConversationMessagesContext.Provider
      value={{
        fetchOlderMessages,
        allMessages,
        noMoreMessages,
        sendMessage,
        attachFiles,
        deleteMessage,
        loading: messages.loading,
        error: messages.error,
        addReaction,
      }}
    >
      {children}
    </ConversationMessagesContext.Provider>
  );
}

export const useConversationMessages = () =>
  useContext(ConversationMessagesContext);
