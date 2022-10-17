import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { ReactNode, useCallback, useContext } from "react";
import { IMessage, Message } from "../models/chat/Message";
import { ReplyRecipient } from "../models/chat/ReplyRecipient";
import { Sender } from "../models/chat/Sender";
import { useCuttinboard } from "./Cuttinboard";
import { Database, Firestore, Storage } from "../firebase";
import { push, ref as RTDBRef, serverTimestamp, set } from "firebase/database";
import {
  doc,
  updateDoc,
  serverTimestamp as FirestoreServerTimestamp,
} from "firebase/firestore";
import { composeMessage } from "./composeMessage";
import useBaseMessaging from "./useBaseMessaging";
import { Attachment } from "models";

interface DirectMessagesContextProps {
  fetchOlderMessages: () => Promise<void>;
  allMessages: Message[];
  noMoreMessages: boolean;
  sendMessage: (
    messageTxt: string,
    replyTargetMessage?: Message
  ) => Promise<void>;
  attachFiles: (
    file: File | Blob | Uint8Array | ArrayBuffer,
    fileName: string,
    mimeType: string,
    message: string | null,
    replyTargetMessage?: Message
  ) => Promise<void>;
  loading: boolean;
  error: Error;
}

const DirectMessagesContext = React.createContext<DirectMessagesContextProps>(
  {} as DirectMessagesContextProps
);

export function DirectMessagesProvider({
  children,
  chatId,
}: {
  children: ReactNode;
  chatId: string;
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

  const sendMessage = useCallback(
    async (messageTxt: string, replyTargetMessage?: Message) => {
      const sender: Sender = {
        id: user.uid,
        name: user.displayName,
      };

      const msg = {
        ...composeMessage(sender, messageTxt, replyTargetMessage),
        seenBy: { [user.uid]: true },
      };

      try {
        await push(RTDBRef(Database, chatPath), msg);
        await updateDoc(doc(Firestore, "DirectMessage", chatId), {
          recentMessage: FirestoreServerTimestamp(),
        });
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
      replyTargetMessage?: Message
    ) => {
      const sender: Sender = {
        id: user.uid,
        name: user.displayName,
      };

      const fileRef = ref(Storage, `directMessages/${chatId}/${fileName}`);

      const msg: Partial<IMessage<object> & { type: "attachment" }> = {
        type: "attachment",
        sender,
        createdAt: serverTimestamp(),
        seenBy: { [user.uid]: true },
      };

      if (replyTargetMessage) {
        msg.replyTarget = replyTargetMessage.toReplyData;
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
        await updateDoc(doc(Firestore, "DirectMessage", chatId), {
          recentMessage: FirestoreServerTimestamp(),
        });
      } catch (error) {
        throw error;
      }
    },
    [chatId]
  );

  return (
    <DirectMessagesContext.Provider
      value={{
        fetchOlderMessages,
        allMessages,
        noMoreMessages,
        sendMessage,
        attachFiles,
        loading: messages.loading,
        error: messages.error,
      }}
    >
      {children}
    </DirectMessagesContext.Provider>
  );
}

export const useDirectMessages = () => useContext(DirectMessagesContext);
