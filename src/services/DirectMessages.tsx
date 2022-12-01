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

interface DirectMessagesContextProps {
  fetchOlderMessages: () => Promise<void>;
  allMessages?: Message[];
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
  error?: Error;
  getAttachmentRefPath: (fileName: string) => string;
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
    </DirectMessagesContext.Provider>
  );
}

export const useDirectMessages = () => useContext(DirectMessagesContext);
