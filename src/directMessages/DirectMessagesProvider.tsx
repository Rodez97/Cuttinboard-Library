import { doc, setDoc, Timestamp } from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ICuttinboardUser,
  IDirectMessage,
  IEmployee,
  Sender,
} from "@cuttinboard-solutions/types-helpers";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { FIRESTORE } from "../utils/firebase";
import {
  createDirectMessageId,
  getDirectMessageRecipient,
  toggleMuteDM,
} from "./dmUtils";
import { useDMData } from "./useDMData";

/**
 * The interface for the context data used by the DirectMessage component.
 */
export interface DirectMessagesContext {
  /**
   * A function that starts a new direct message with the specified user.
   * @param recipient The recipient of the direct message.
   * @returns The ID of the new direct message chat.
   */
  startNewDirectMessageChat: (
    recipient: IEmployee | ICuttinboardUser
  ) => Promise<string | undefined>;
  toggleMuteChat: (dm: IDirectMessage) => Promise<void>;
  selectedDirectMessage: IDirectMessage | undefined;
  selectDirectMessage: (dmId: string | undefined) => void;
  directMessages: IDirectMessage[];
  loading: boolean;
  error: Error | undefined;
  recipientUser: Sender | undefined;
}

/**
 * The context used by the DirectMessage component.
 */
export const DirectMessagesProviderContext =
  createContext<DirectMessagesContext>({} as DirectMessagesContext);

interface DirectMessagesProviderProps {
  children: ReactNode;
}

export function DirectMessagesProvider({
  children,
}: DirectMessagesProviderProps) {
  const { user, onError } = useCuttinboard();
  const [selectedDirectMessageId, selectDirectMessage] = useState<string>();
  const { directMessages, error, loading } = useDMData();

  const selectedDirectMessage = useMemo(() => {
    return directMessages.find((dm) => dm.id === selectedDirectMessageId);
  }, [directMessages, selectedDirectMessageId]);

  const startNewDirectMessageChat = useCallback(
    async ({ id, name, lastName, avatar }: IEmployee | ICuttinboardUser) => {
      if (user.uid === id) {
        throw new Error(
          "You cannot start a direct message chat with yourself."
        );
      }

      if (!user.displayName) {
        throw new Error(
          "You must have a display name to start a direct message."
        );
      }

      const chatId = createDirectMessageId(user.uid, id);

      if (directMessages.some((chat) => chat.id === chatId)) {
        return chatId;
      }

      const newDM: IDirectMessage = {
        id: chatId,
        createdAt: Timestamp.now().toMillis(),
        members: {
          [user.uid]: {
            _id: user.uid,
            name: user.displayName,
            avatar: user.photoURL || "",
          },
          [id]: {
            _id: id,
            name: `${name} ${lastName}`,
            avatar: avatar || "",
          },
        },
      };

      try {
        await setDoc(doc(FIRESTORE, "directMessages", newDM.id), newDM);
        return chatId;
      } catch (error) {
        onError(error);
      }
    },
    [user.uid, user.displayName, user.photoURL, directMessages, onError]
  );

  const toggleMuteChat = useCallback(
    async (dm: IDirectMessage) => {
      const updates = toggleMuteDM(dm);
      if (!updates) {
        return;
      }
      try {
        await setDoc(doc(FIRESTORE, "directMessages", dm.id), updates, {
          merge: true,
        });
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const recipientUser = useMemo(
    () =>
      selectedDirectMessage
        ? getDirectMessageRecipient(selectedDirectMessage, user.uid)
        : undefined,
    [selectedDirectMessage, user.uid]
  );

  return (
    <DirectMessagesProviderContext.Provider
      value={{
        startNewDirectMessageChat,
        toggleMuteChat,
        selectedDirectMessage,
        selectDirectMessage,
        directMessages,
        loading,
        error,
        recipientUser,
      }}
    >
      {children}
    </DirectMessagesProviderContext.Provider>
  );
}
