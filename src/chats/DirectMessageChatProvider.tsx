import {
  collection,
  doc,
  FirestoreError,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import React, { createContext, ReactNode, useMemo, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { FIRESTORE } from "../utils/firebase";
import {
  set,
  serverTimestamp as dbServerTimestamp,
  ref,
} from "firebase/database";
import { DATABASE } from "../utils/firebase";
import { Chat } from "./Chat";
import { useCuttinboard } from "../services";
import { CuttinboardUser } from "../account";
import { Employee } from "../employee";

/**
 * The interface for the context data used by the DirectMessage component.
 */
export interface IDirectMessageChatContext {
  /**
   * The list of direct message chats that the current user is a member of.
   */
  directMessageChats?: Chat[];

  /**
   * The currently selected direct message chat.
   */
  selectedDirectMessageChat?: Chat;

  /**
   * The ID of the currently selected direct message chat.
   */
  selectedDirectMessageChatId: string;

  /**
   * A function that sets the ID of the currently selected direct message chat.
   * @param chatId The ID of the direct message chat to set as the selected chat.
   */
  setSelectedDirectMessageChatId: (chatId: string) => void;

  /**
   * A function that starts a new direct message with the specified user.
   * @param recipient The recipient of the direct message.
   * @returns The ID of the new direct message chat.
   */
  startNewDirectMessageChat: (
    recipient: CuttinboardUser | Employee
  ) => Promise<string>;

  /**
   * Indicates whether the context data is currently being loaded.
   */
  isLoading: boolean;

  /**
   * Indicates whether an error occurred while loading the context data.
   */
  error?: Error;
}

/**
 * The context used by the DirectMessage component.
 */
export const DirectMessageChatContext =
  createContext<IDirectMessageChatContext>({} as IDirectMessageChatContext);

interface IDirectMessageChatProvider {
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

export function DirectMessageChatProvider({
  children,
}: IDirectMessageChatProvider) {
  const { user } = useCuttinboard();
  const [selectedDirectMessageChatId, setSelectedDirectMessageChatId] =
    useState("");
  const [directMessageChats, isLoading, error] = useCollectionData<Chat>(
    query(
      collection(FIRESTORE, "DirectMessages"),
      where("membersList", "array-contains", user.uid)
    ).withConverter(Chat.firestoreConverter)
  );

  const selectedDirectMessageChat = useMemo(
    () =>
      directMessageChats?.find((cht) => cht.id === selectedDirectMessageChatId),
    [selectedDirectMessageChatId, directMessageChats]
  );

  const createChatId = (userId: string, recipientId: string) =>
    [userId, recipientId].sort().join("&");

  const startNewDirectMessageChat = async ({
    id,
    name,
    lastName,
    avatar,
  }: Employee | CuttinboardUser) => {
    if (user.uid === id) {
      throw new Error("You cannot start a direct message chat with yourself.");
    }

    const chatId = createChatId(user.uid, id);

    if (directMessageChats?.some((chat) => chat.id === chatId)) {
      return chatId;
    }

    const newDM = {
      createdAt: serverTimestamp(),
      members: {
        [user.uid]: {
          id: user.uid,
          name: user.displayName,
          avatar: user.photoURL,
        },
        [id]: {
          id,
          name: `${name} ${lastName}`,
          avatar,
        },
      },
      membersList: [user.uid, id],
    };

    await setDoc(doc(FIRESTORE, "DirectMessages", chatId), newDM);
    await set(ref(DATABASE, `directMessages/${chatId}/firstMessage`), {
      createdAt: dbServerTimestamp(),
      message: "START",
      systemType: "start",
      type: "system",
    });

    return chatId;
  };

  return (
    <DirectMessageChatContext.Provider
      value={{
        directMessageChats,
        selectedDirectMessageChatId,
        setSelectedDirectMessageChatId,
        selectedDirectMessageChat,
        startNewDirectMessageChat,
        isLoading,
        error,
      }}
    >
      {typeof children === "function"
        ? children({
            loading: isLoading,
            error,
            chats: directMessageChats,
            selectedChat: selectedDirectMessageChat,
          })
        : children}
    </DirectMessageChatContext.Provider>
  );
}
