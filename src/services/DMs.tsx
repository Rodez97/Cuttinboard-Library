import {
  collection,
  doc,
  FieldValue,
  FirestoreError,
  query,
  serverTimestamp,
  setDoc,
  where,
  WithFieldValue,
} from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Chat, IChat } from "../models/chat/Chat";
import { Auth, Firestore } from "../firebase";
import {
  set,
  serverTimestamp as dbServerTimestamp,
  ref,
} from "firebase/database";
import { Database } from "./../firebase";
import { CuttinboardUser, Employee } from "models";

interface DMsContextProps {
  chats: Chat[];
  selectedChat?: Chat;
  chatId: string;
  setChatId: (chtId: string) => void;
  startNewDMByEmail: (recipient: CuttinboardUser) => Promise<string>;
  startNewLocationDM: (recipient: Employee) => Promise<string>;
  loading: boolean;
  error: Error;
}

const DMsContext = createContext<DMsContextProps>({} as DMsContextProps);

interface DMsProviderProps {
  children:
    | ReactNode
    | ((props: {
        loading: boolean;
        error: Error;
        chats: Chat[];
        selectedChat: Chat | undefined;
      }) => JSX.Element);
  onError: (error: Error | FirestoreError) => void;
}

export function DMsProvider({ children, onError }: DMsProviderProps) {
  const [chatId, setChatId] = useState("");
  const [user] = useState(Auth.currentUser);
  const [chats, loading, error] = useCollectionData<Chat>(
    query(
      collection(Firestore, "DirectMessages"),
      where("membersList", "array-contains", Auth.currentUser.uid)
    ).withConverter(Chat.Converter)
  );

  const selectedChat = useMemo(
    () => chats?.find((cht) => cht.id === chatId),
    [chatId, chats]
  );

  const startNewDMByEmail = async (recipient: CuttinboardUser) => {
    const DmId = [user.uid, recipient.id].sort().join("&");

    if (chats.some((chat) => chat.id === DmId)) {
      return DmId;
    }

    const { name, lastName } = recipient;

    const newDM: WithFieldValue<IChat> = {
      createdAt: serverTimestamp(),
      members: {
        [user.uid]: user.displayName,
        [recipient.id]: `${name} ${lastName}`,
      },
      membersList: [user.uid, recipient.id],
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
    const DmId = [user.uid, id].sort().join("&");

    if (chats.some((chat) => chat.id === DmId)) {
      return DmId;
    }

    const newDM: WithFieldValue<IChat> = {
      createdAt: serverTimestamp(),
      members: { [user.uid]: user.displayName, [id]: `${name} ${lastName}` },
      membersList: [user.uid, id],
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
