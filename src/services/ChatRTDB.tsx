import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { compact, findIndex, isEmpty, orderBy } from "lodash";
import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MessageType } from "../models/chat/MessageType";
import { Message } from "../models/chat/Message";
import { Sender } from "../models/chat/Sender";
import { useCuttinboard } from "./Cuttinboard";
import { Database, Firestore, Storage } from "../firebase";
import {
  DataSnapshot,
  endBefore,
  limitToLast,
  off,
  onChildAdded as firebaseOnChildAdded,
  onChildChanged as firebaseOnChildChanged,
  onChildRemoved as firebaseOnChildRemoved,
  onValue as firebaseOnValue,
  orderByChild,
  push,
  query,
  ref as RTDBRef,
  remove,
  serverTimestamp,
  set,
  update,
} from "firebase/database";
import useListReducer from "./useListReducer";
import { useLocation } from "./Location";
import {
  arrayRemove,
  arrayUnion,
  doc,
  updateDoc,
  serverTimestamp as FirestoreServerTimestamp,
} from "firebase/firestore";
import { useEmployeesList } from "./useEmployeesList";

interface ChatRTDBContextProps {
  fetchOlderMessages: () => Promise<void>;
  allMessages: Message[];
  noMoreMessages: boolean;
  sendMessage: (
    messageTxt: string,
    replyTargetMessage:
      | (Message & {
          type: MessageType;
        })
      | null
  ) => Promise<void>;
  attachFiles: (
    file: File | Blob | Uint8Array | ArrayBuffer,
    fileName: string,
    mimeType: string,
    message: string | null,
    replyTargetMessage:
      | (Message & {
          type: MessageType;
        })
      | null
  ) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  loading: boolean;
  error: Error;
  addReaction: (messageId: string, emoji?: string) => Promise<void>;
  updateLastVisitedBy: (messageId: string) => Promise<void>;
  toggleChatMute: (mute?: boolean) => Promise<void>;
}

const ChatRTDBContext = React.createContext<ChatRTDBContextProps>(
  {} as ChatRTDBContextProps
);

export function ChatRTDBProvider({
  chatType,
  children,
  chatId,
  members,
}: {
  chatType: "chats" | "conversations";
  children: ReactNode;
  chatId: string;
  members: string[];
}) {
  const { user } = useCuttinboard();
  const { getUniqAllEmployees } = useEmployeesList();
  const { location, locationId } = useLocation();
  const [noMoreMessages, setNoMoreMessages] = useState(false);
  const [messages, dispatch] = useListReducer();
  const chatPath = useMemo(
    () =>
      chatType === "chats"
        ? `chatMessages/${location.organizationId}/${chatId}`
        : `conversationMessages/${location.organizationId}/${locationId}/${chatId}`,
    [chatType, location, chatId, locationId]
  );

  useEffect(() => {
    const deletedRef = RTDBRef(Database, chatPath);
    const reference = query(
      RTDBRef(Database, chatPath),
      orderByChild("createdAt"),
      limitToLast(50)
    );

    const onChildAdded = (snapshot: DataSnapshot | null) => {
      dispatch({
        type: "add",
        snapshot: { ...snapshot.val(), id: snapshot.key },
      });
    };

    const onChildChanged = (snapshot: DataSnapshot | null) => {
      dispatch({
        type: "change",
        snapshot: { ...snapshot.val(), id: snapshot.key },
      });
    };

    const onChildRemoved = (snapshot: DataSnapshot | null) => {
      dispatch({
        type: "remove",
        snapshot: { ...snapshot.val(), id: snapshot.key },
      });
    };

    const onError = (error: Error) => {
      dispatch({ type: "error", error });
    };

    const onValue = (snapshots: DataSnapshot[] | null) => {
      dispatch({
        type: "value",
        snapshots: snapshots.map((snp) => ({
          ...snp.val(),
          id: snp.key,
        })),
      });
    };

    let childAddedHandler: ReturnType<typeof firebaseOnChildAdded> | undefined;
    const onInitialLoad = (snapshot: DataSnapshot) => {
      const snapshotVal = snapshot.val();
      let childrenToProcess = snapshotVal
        ? Object.keys(snapshot.val()).length
        : 0;

      // If the list is empty then initialise the hook and use the default `onChildAdded` behaviour
      if (childrenToProcess === 0) {
        childAddedHandler = firebaseOnChildAdded(
          reference,
          onChildAdded,
          onError
        );
        onValue([]);
      } else {
        // Otherwise, we load the first batch of children all to reduce re-renders
        const children: DataSnapshot[] = [];

        const onChildAddedWithoutInitialLoad = (addedChild: DataSnapshot) => {
          if (childrenToProcess > 0) {
            childrenToProcess--;
            children.push(addedChild);

            if (childrenToProcess === 0) {
              onValue(children);
            }

            return;
          }

          onChildAdded(addedChild);
        };

        childAddedHandler = firebaseOnChildAdded(
          reference,
          onChildAddedWithoutInitialLoad,
          onError
        );
      }
    };

    firebaseOnValue(reference, onInitialLoad, onError, { onlyOnce: true });
    const childChangedHandler = firebaseOnChildChanged(
      reference,
      onChildChanged,
      onError
    );
    const childRemovedHandler = firebaseOnChildRemoved(
      deletedRef,
      onChildRemoved,
      onError
    );

    return () => {
      off(reference, "child_added", childAddedHandler);
      off(reference, "child_changed", childChangedHandler);
      off(deletedRef, "child_removed", childRemovedHandler);
    };
  }, [dispatch, chatType, chatId, chatPath]);

  const allMessages = useMemo(() => {
    if (messages.loading || messages.error) {
      return [];
    }
    return orderBy(messages.value, "createdAt", "desc");
  }, [messages]);

  const fetchOlderMessages = useCallback(
    async () =>
      new Promise<void>((resolve, reject) => {
        if (allMessages?.length === 0 || noMoreMessages) {
          resolve();
        }
        const { createdAt, ...firstMessage } =
          allMessages[allMessages.length - 1];

        if (
          firstMessage.type === "system" &&
          firstMessage.systemType === "start"
        ) {
          setNoMoreMessages(true);
          resolve();
        }
        try {
          const chatsRef = query(
            RTDBRef(Database, chatPath),
            orderByChild("createdAt"),
            limitToLast(20),
            endBefore(createdAt)
          );

          return firebaseOnValue(
            chatsRef,
            (snapshot) => {
              const olderMessages: Message[] = [];

              snapshot.forEach((snp) => {
                olderMessages.push({ ...snp.val(), id: snp.key });
              });

              dispatch({
                type: "appendOlder",
                snapshot: olderMessages,
              });

              resolve();
            },
            {
              onlyOnce: true,
            }
          );
        } catch (error) {
          reject(error);
        }
      }),
    [noMoreMessages, chatId, allMessages, location, chatType, dispatch]
  );

  const sendMessage = useCallback(
    async (
      messageTxt: string,
      replyTargetMessage: (Message & { type: MessageType }) | null
    ) => {
      const sender: Sender = {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL,
      };

      const msg: Partial<Message<object>> = {
        createdAt: serverTimestamp(),
        sender,
      };

      if (chatType === "chats") {
        msg.seenBy = { [user.uid]: true };
      }

      if (replyTargetMessage) {
        const { replyTarget, ...others } = replyTargetMessage;
        msg.replyTarget = others;
      }

      if (
        /(?:(?:https?:\/\/))[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/=]*(\.jpg|\.png|\.jpeg))([-a-zA-Z0-9@:%._\+~#=?&]{2,256})?/g.test(
          messageTxt
        )
      ) {
        msg.srcUrl = messageTxt;
        msg.type = "image";
        msg.message = "🖼️ Image Message";
      } else if (
        /(?:(?:https?:\/\/))[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/=]*(\.webm|\.mkv|\.flv|\.og[g|v]|\.avi|\.mp4|\.3gp))([-a-zA-Z0-9@:%._\+~#=?&]{2,256})?/g.test(
          messageTxt
        )
      ) {
        msg.type = "video";
        msg.srcUrl = messageTxt;
        msg.message = "🎞️ Video Message";
      } else if (
        /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/gm.test(
          messageTxt
        )
      ) {
        msg.type = "yt";
        msg.srcUrl = messageTxt;
        msg.message = "🟥 YouTube video";
      } else {
        msg.message = messageTxt.trim();
      }

      const tokens = getUniqAllEmployees()
        .filter((e) => members.indexOf(e.id) > -1 && e.id !== user.uid)
        .flatMap((x) => x.expoToolsTokens);

      const compactTokens = compact(tokens);

      msg.notificationData = {
        locationName: location.name,
      };

      if (compactTokens.length > 0) {
        msg.notificationData.tokens = compactTokens;
      }

      try {
        await push(RTDBRef(Database, chatPath), msg);
        if (chatType === "chats") {
          await updateDoc(
            doc(
              Firestore,
              "Organizations",
              location.organizationId,
              "directMessages",
              chatId
            ),
            {
              recentMessage: FirestoreServerTimestamp(),
            }
          );
        }
      } catch (error) {
        throw error;
      }
    },
    [chatId, chatType]
  );

  const updateLastVisitedBy = useCallback(
    async (messageId: string) => {
      try {
        await set(
          RTDBRef(Database, `${chatPath}/${messageId}/seenBy/${user.uid}`),
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
      replyTargetMessage: (Message & { type: MessageType }) | null
    ) => {
      const sender: Sender = {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL,
      };

      const fileRef = ref(
        Storage,
        `organizations/${location.organizationId}/locations/${locationId}/${
          chatType === "chats" ? `chatMessages` : `conversationMessages`
        }/${chatId}/${fileName}`
      );

      const msg: Partial<Message<object>> = {
        sender,
        message,
        createdAt: serverTimestamp(),
        uploaded: true,
        attachment: {
          mimeType,
          source: fileRef.fullPath,
          filename: fileName,
        },
      };

      if (chatType === "chats") {
        msg.seenBy = { [user.uid]: true };
      }

      if (replyTargetMessage) {
        const { replyTarget, ...others } = replyTargetMessage;
        msg.replyTarget = others;
      }

      if (mimeType.includes("image")) {
        msg.type = "image";
        msg.message = "🖼️ Image Message";
      } else if (mimeType.includes("video")) {
        msg.type = "video";
        msg.message = "🎞️ Video Message";
      } else if (mimeType.includes("audio")) {
        msg.type = "audio";
        msg.message = "🎵 Audio Message";
      } else {
        msg.type = "file";
        msg.message = "📁 File Message";
      }
      if (message) {
        msg.message = message;
      }
      try {
        await uploadBytes(fileRef, file);
        msg.srcUrl = await getDownloadURL(fileRef);

        const tokens = getUniqAllEmployees()
          .filter((e) => members.indexOf(e.id) > -1 && e.id !== user.uid)
          .flatMap((x) => x.expoToolsTokens);

        const compactTokens = compact(tokens);

        msg.notificationData = {
          locationName: location.name,
        };

        if (compactTokens.length > 0) {
          msg.notificationData.tokens = compactTokens;
        }

        await push(RTDBRef(Database, chatPath), msg);
      } catch (error) {
        throw error;
      }
    },
    [chatId, chatType, location.organizationId]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        await remove(RTDBRef(Database, `${chatPath}/${messageId}`));
      } catch (error) {
        throw error;
      }
    },
    [chatPath]
  );

  const addReaction = useCallback(
    async (messageId: string, emoji?: string) => {
      try {
        await set(
          RTDBRef(Database, `${chatPath}/${messageId}/reactions/${user.uid}`),
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
    [allMessages, dispatch]
  );

  const toggleChatMute = async (mute: boolean) => {
    try {
      await updateDoc(
        doc(
          Firestore,
          "Organizations",
          location.organizationId,
          chatType === "chats" ? "directMessages" : "conversations",
          chatId
        ),
        { muted: mute ? arrayUnion(user.uid) : arrayRemove(user.uid) }
      );
    } catch (error) {
      throw error;
    }
  };

  return (
    <ChatRTDBContext.Provider
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
        toggleChatMute,
      }}
    >
      {children}
    </ChatRTDBContext.Provider>
  );
}

export const useChatRTDB = () => useContext(ChatRTDBContext);
