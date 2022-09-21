import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  FieldValue,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
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
import { Chat, ChatFirestoreConverter } from "../models/chat/Chat";
import { Auth, Firestore } from "../firebase";
import { useLocation } from "./Location";
import {
  set,
  serverTimestamp as dbServerTimestamp,
  ref,
} from "firebase/database";
import { Database } from "./../firebase";

interface DMsContextProps {
  chats: Chat[];
  selectedChat?: Chat;
  chatId: string;
  setChatId: (chtId: string) => void;
  startNewDM: (recipientId: string) => Promise<string>;
  toggleChatMute: (mute: boolean) => Promise<void>;
}

const DMsContext = createContext<DMsContextProps>({} as DMsContextProps);

interface DMsProviderProps {
  children: ReactNode;
  LoadingElement: JSX.Element;
  ErrorElement: (error: Error) => JSX.Element;
}

export function DMsProvider({
  children,
  LoadingElement,
  ErrorElement,
}: DMsProviderProps) {
  const [chatId, setChatId] = useState("");
  const [user] = useState(Auth.currentUser);
  const { location, locationId } = useLocation();
  const [chats, loading, error] = useCollectionData<Chat>(
    query(
      collection(
        Firestore,
        "Organizations",
        location.organizationId,
        "directMessages"
      ),
      where(`members.${user.uid}`, "==", true),
      where("locations", "array-contains", locationId)
    ).withConverter(ChatFirestoreConverter)
  );

  const selectedChat = useMemo(
    () => chats?.find((cht) => cht.id === chatId),
    [chatId, chats]
  );

  const startNewDM = async (recipientId: string) => {
    const DmId =
      user.uid.localeCompare(recipientId) === 1
        ? `${recipientId}&${user.uid}`
        : `${user.uid}&${recipientId}`;

    if (chats.some((chat) => chat.id === DmId)) {
      return DmId;
    }
    const newDM: Partial<Chat<FieldValue, FieldValue>> = {
      createdAt: serverTimestamp(),
      members: { [user.uid]: true, [recipientId]: true },
      locations: arrayUnion(locationId),
    };
    try {
      await setDoc(
        doc(
          Firestore,
          "Organizations",
          location.organizationId,
          "directMessages",
          DmId
        ),
        newDM
      );
      await set(
        ref(
          Database,
          `chatMessages/${location.organizationId}/${DmId}/firstMessage`
        ),
        {
          createdAt: dbServerTimestamp(),
          message: "START",
          systemType: "start",
          type: "system",
        }
      );
      return DmId;
    } catch (error) {
      throw error;
    }
  };

  const toggleChatMute = async (mute: boolean) => {
    try {
      await updateDoc(
        doc(
          Firestore,
          "Organizations",
          location.organizationId,
          "directMessages",
          chatId
        ),
        { muted: mute ? arrayUnion(user.uid) : arrayRemove(user.uid) }
      );
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
        startNewDM,
        toggleChatMute,
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
