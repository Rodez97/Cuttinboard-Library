import {
  arrayUnion,
  collection,
  doc,
  DocumentData,
  getDoc,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Chat, ChatFirestoreConverter } from "../models/chat/Chat";
import { Auth, Firestore } from "../firebase";
import {
  set,
  serverTimestamp as dbServerTimestamp,
  ref,
} from "firebase/database";
import { Database } from "./../firebase";
import { Employee } from "models";

interface DMsContextProps {
  chats: Chat[];
  selectedChat?: Chat;
  chatId: string;
  setChatId: (chtId: string) => void;
  toggleChatMute: () => Promise<void>;
  startNewDMByEmail: (
    recipient: QueryDocumentSnapshot<DocumentData>
  ) => Promise<string>;
  startNewLocationDM: (recipient: Employee) => Promise<string>;
}

const DMsContext = createContext<DMsContextProps>({} as DMsContextProps);

interface DMsProviderProps {
  children: ReactNode;
  LoadingElement: JSX.Element;
  ErrorElement: (error: Error) => JSX.Element;
  locationId?: string;
}

export function DMsProvider({
  children,
  LoadingElement,
  ErrorElement,
  locationId,
}: DMsProviderProps) {
  const [chatId, setChatId] = useState("");
  const [user] = useState(Auth.currentUser);
  const [chats, loading, error] = useCollectionData<Chat>(
    query(
      collection(Firestore, "DirectMessages"),
      orderBy(`members.${user.uid}`)
    ).withConverter(ChatFirestoreConverter)
  );

  const selectedChat = useMemo(
    () => chats?.find((cht) => cht.id === chatId),
    [chatId, chats]
  );

  const startNewDMByEmail = async (
    recipient: QueryDocumentSnapshot<DocumentData>
  ) => {
    const DmId =
      user.uid.localeCompare(recipient.id) === 1
        ? `${recipient.id}&${user.uid}`
        : `${user.uid}&${recipient.id}`;

    if (chats.some((chat) => chat.id === DmId)) {
      return DmId;
    }

    const { name, lastName } = recipient.data();

    const newDM: any = {
      createdAt: serverTimestamp(),
      members: {
        [user.uid]: user.displayName,
        [recipient.id]: `${name} ${lastName}`,
      },
    };
    try {
      await setDoc(doc(Firestore, "DirectMessages", DmId), newDM);
      await set(ref(Database, `directMessages/${DmId}/firstMessage`), {
        createdAt: dbServerTimestamp(),
        message: "START",
        systemType: "start",
        type: "system",
      });
      return DmId;
    } catch (error) {
      throw error;
    }
  };

  const startNewLocationDM = async ({ id, name, lastName }: Employee) => {
    const DmId =
      user.uid.localeCompare(id) === 1
        ? `${id}&${user.uid}`
        : `${user.uid}&${id}`;

    if (chats.some((chat) => chat.id === DmId)) {
      return DmId;
    }

    // Check if chat exists
    const dmSnap = await getDoc(doc(Firestore, "DirectMessages", DmId));

    if (dmSnap.exists() && dmSnap.data()) {
      try {
        await updateDoc(doc(Firestore, "DirectMessages", DmId), {
          locations: arrayUnion(locationId),
        });
        return DmId;
      } catch (error) {
        throw error;
      }
    }

    const newDM: any = {
      createdAt: serverTimestamp(),
      members: { [user.uid]: user.displayName, [id]: `${name} ${lastName}` },
      locations: arrayUnion(locationId),
    };

    try {
      await setDoc(doc(Firestore, "DirectMessages", DmId), newDM);
      await set(ref(Database, `directMessages/${DmId}/firstMessage`), {
        createdAt: dbServerTimestamp(),
        message: "START",
        systemType: "start",
        type: "system",
      });
      return DmId;
    } catch (error) {
      throw error;
    }
  };

  const toggleChatMute = async () => {
    try {
      await selectedChat.toggleMuteChat(user.uid);
    } catch (error) {
      throw error;
    }
  };

  if (loading) {
    return LoadingElement;
  }
  if (error) {
    return ErrorElement(error);
  }

  return (
    <DMsContext.Provider
      value={{
        chats,
        chatId,
        setChatId,
        selectedChat,
        startNewDMByEmail,
        toggleChatMute,
        startNewLocationDM,
      }}
    >
      {children}
    </DMsContext.Provider>
  );
}

export const useDMs = () => {
  const context = useContext(DMsContext);
  if (context === undefined) {
    throw new Error("useDMs must be used within a DMsProvider");
  }
  return context;
};
