import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { findIndex, isEmpty } from "lodash";
import React, { ReactNode, useCallback, useContext } from "react";
import { Message } from "../models/chat/Message";
import { Sender } from "../models/chat/Sender";
import { useCuttinboard } from "./Cuttinboard";
import { Database, Firestore, Storage } from "../firebase";
import {
  push,
  ref as RTDBRef,
  remove,
  serverTimestamp,
  set,
} from "firebase/database";
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
  updateLastVisitedBy: (messageId: string) => Promise<void>;
}

const DirectMessagesContext = React.createContext<DirectMessagesContextProps>(
  {} as DirectMessagesContextProps
);

export function DirectMessagesProvider({
  children,
  chatId,
  members,
}: {
  children: ReactNode;
  chatId: string;
  members: string[];
}) {
  const { user } = useCuttinboard();
  const {
    chatPath,
    messages,
    dispatch,
    noMoreMessages,
    fetchOlderMessages,
    allMessages,
  } = useBaseMessaging(`directMessages/${chatId}`);

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

  const updateLastVisitedBy = useCallback(
    async (messageId: string) => {
      try {
        await set(
          RTDBRef(
            Database,
            `directMessages/${chatId}/${messageId}/seenBy/${user.uid}`
          ),
          true
        );
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

      const fileRef = ref(Storage, `directMessages/${chatId}/${fileName}`);

      const msg: Partial<Message<object> & { type: "attachment" }> = {
        type: "attachment",
        sender,
        createdAt: serverTimestamp(),
        seenBy: { [user.uid]: true },
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
        await updateDoc(doc(Firestore, "DirectMessage", chatId), {
          recentMessage: FirestoreServerTimestamp(),
        });
      } catch (error) {
        throw error;
      }
    },
    [chatId]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        await remove(
          RTDBRef(Database, `directMessages/${chatId}/${messageId}`)
        );
      } catch (error) {
        throw error;
      }
    },
    [chatId]
  );

  const addReaction = useCallback(
    async (messageId: string, emoji?: string) => {
      try {
        await set(
          RTDBRef(
            Database,
            `directMessages/${chatId}/${messageId}/reactions/${user.uid}`
          ),
          emoji ? emoji : null
        );
        const index = findIndex(allMessages, (m) => m.id === messageId);
        if (index > 49) {
          const altMessage = allMessages[index];
          if (altMessage.type === "system") {
            return;
          }
          if (emoji) {
            altMessage.reactions = {
              ...altMessage.reactions,
              [user.uid]: emoji,
            };
          } else {
            delete altMessage.reactions[user.uid];
            if (isEmpty(altMessage.reactions)) {
              delete altMessage.reactions;
            }
          }
          dispatch({
            type: "change",
            snapshot: altMessage,
          });
        }
      } catch (error) {
        throw error;
      }
    },
    [allMessages, dispatch, chatId]
  );

  return (
    <DirectMessagesContext.Provider
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
        updateLastVisitedBy,
      }}
    >
      {children}
    </DirectMessagesContext.Provider>
  );
}

export const useDirectMessages = () => useContext(DirectMessagesContext);
