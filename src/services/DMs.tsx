import {
  collection,
  doc,
  FirestoreError,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Chat } from "../models/chat/Chat";
import { Auth, Firestore } from "../firebase";
import {
  set,
  serverTimestamp as dbServerTimestamp,
  ref,
} from "firebase/database";
import { Database } from "./../firebase";
import { CuttinboardUser, Employee } from "models";

interface DMsContextProps {
  chats?: Chat[];
  selectedChat?: Chat;
  chatId: string;
  setChatId: (chtId: string) => void;
  startNewDMByEmail: (recipient: CuttinboardUser) => Promise<string>;
  startNewLocationDM: (recipient: Employee) => Promise<string>;
  loading: boolean;
  error?: Error;
}

const DMsContext = createContext<DMsContextProps>({} as DMsContextProps);

interface DMsProviderProps {
  children:
    | ReactNode
    | ((props: {
        loading: boolean;
        error?: Error;
        chats?: Chat[];
        selectedChat?: Chat;
      }) => JSX.Element);
  onError: (error: Error | FirestoreError) => void;
}

export function DMsProvider({ children }: DMsProviderProps) {
  const [chatId, setChatId] = useState("");
  const [chats, loading, error] = useCollectionData<Chat>(
    query(
      collection(Firestore, "DirectMessages"),
      where("membersList", "array-contains", Auth.currentUser?.uid)
    ).withConverter(Chat.Converter)
  );

  const selectedChat = useMemo(
    () => chats?.find((cht) => cht.id === chatId),
    [chatId, chats]
  );

  const startNewDMByEmail = async (recipient: CuttinboardUser) => {
    if (!Auth.currentUser) {
      throw new Error("No user logged in");
    }
    const DmId = [Auth.currentUser.uid, recipient.id].sort().join("&");

    if (chats?.some((chat) => chat.id === DmId)) {
      return DmId;
    }

    const { name, lastName } = recipient;

    const newDM = {
      createdAt: serverTimestamp(),
      members: {
        [Auth.currentUser.uid]: {
          fullName: Auth.currentUser.displayName,
          avatar: Auth.currentUser.photoURL,
        },
        [recipient.id]: {
          fullName: `${name} ${lastName}`,
          avatar: recipient.avatar,
        },
      },
      membersList: [Auth.currentUser.uid, recipient.id],
    };

    await setDoc(doc(Firestore, "DirectMessages", DmId), newDM);
    await set(ref(Database, `directMessages/${DmId}/firstMessage`), {
      createdAt: dbServerTimestamp(),
      message: "START",
      systemType: "start",
      type: "system",
    });
    return DmId;
  };

  const startNewLocationDM = async ({
    id,
    name,
    lastName,
    avatar,
  }: Employee) => {
    if (!Auth.currentUser) {
      throw new Error("No user logged in");
    }
    const DmId = [Auth.currentUser.uid, id].sort().join("&");

    if (chats?.some((chat) => chat.id === DmId)) {
      return DmId;
    }

    const newDM = {
      createdAt: serverTimestamp(),
      members: {
        [Auth.currentUser.uid]: {
          fullName: Auth.currentUser.displayName,
          avatar: Auth.currentUser.photoURL,
        },
        [id]: {
          fullName: `${name} ${lastName}`,
          avatar,
        },
      },
      membersList: [Auth.currentUser.uid, id],
    };

    await setDoc(doc(Firestore, "DirectMessages", DmId), newDM);
    await set(ref(Database, `directMessages/${DmId}/firstMessage`), {
      createdAt: dbServerTimestamp(),
      message: "START",
      systemType: "start",
      type: "system",
    });
    return DmId;
  };

  return (
    <DMsContext.Provider
      value={{
        chats,
        chatId,
        setChatId,
        selectedChat,
        startNewDMByEmail,
        startNewLocationDM,
        loading,
        error,
      }}
    >
      {typeof children === "function"
        ? children({ loading, error, chats, selectedChat })
        : children}
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
