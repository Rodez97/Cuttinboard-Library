import {
  addDoc,
  collection,
  FirestoreError,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { RoleAccessLevels } from "../utils/RoleAccessLevels";
import { PrivacyLevel } from "../utils/PrivacyLevel";
import { Database, Firestore } from "../firebase";
import { useLocation } from "./Location";
import { Conversation, IConversation } from "../models/chat/Conversation";
import { useEmployeesList } from "./useEmployeesList";
import {
  ref,
  serverTimestamp as dbServerTimestamp,
  set,
} from "firebase/database";
import { useCuttinboard } from "./Cuttinboard";

interface ConversationsContextProps {
  chats: Conversation[];
  selectedChat?: Conversation;
  chatId: string;
  setChatId: (chtId: string) => void;
  canManageApp: boolean;
  canUseApp: boolean;
  createConversation: (
    newConv: Omit<IConversation, "locationId">
  ) => Promise<string>;
  loading: boolean;
  error: Error;
}

const ConversationsContext = createContext<ConversationsContextProps>(
  {} as ConversationsContextProps
);

interface ConversationsProviderProps {
  children:
    | ReactNode
    | ((
        loading: boolean,
        error: Error,
        chats: Conversation[],
        selectedChat: Conversation | undefined
      ) => JSX.Element);
  onError: (error: Error | FirestoreError) => void;
}

export function ConversationsProvider({
  children,
  onError,
}: ConversationsProviderProps) {
  const [chatId, setChatId] = useState("");
  const { user } = useCuttinboard();
  const { getEmployees } = useEmployeesList();
  const { location, locationAccessKey } = useLocation();
  const [chats, loading, error] = useCollectionData<Conversation>(
    (locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER
      ? query(
          collection(
            Firestore,
            "Organizations",
            location.organizationId,
            "conversations"
          ),
          where("locationId", "==", location.id)
        )
      : query(
          collection(
            Firestore,
            "Organizations",
            location.organizationId,
            "conversations"
          ),
          where("locationId", "==", location.id),
          where("members", "array-contains", user.uid)
        )
    ).withConverter(Conversation.Converter)
  );

  const selectedChat = useMemo((): Conversation | null => {
    if (!chatId) {
      return null;
    }
    return chats?.find(({ id }) => id === chatId);
  }, [chatId, chats]);

  const canManageApp = useMemo(() => {
    return Boolean(
      selectedChat?.amIhost ||
        locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER
    );
  }, [user.uid, selectedChat, locationAccessKey]);

  const canUseApp = useMemo((): boolean => {
    if (!selectedChat) {
      return false;
    }
    if (selectedChat.amIhost) {
      return true;
    }
    if (selectedChat.privacyLevel === PrivacyLevel.PUBLIC) {
      return location.members.indexOf(user.uid) !== -1;
    }
    if (selectedChat.privacyLevel === PrivacyLevel.PRIVATE) {
      return Boolean(selectedChat.members.indexOf(user.uid) !== -1);
    }
    if (selectedChat.privacyLevel === PrivacyLevel.POSITIONS) {
      return selectedChat.positions?.some((pos1) =>
        locationAccessKey.pos?.includes(pos1)
      );
    }
    return false;
  }, [user.uid, selectedChat, location, locationAccessKey]);

  const createConversation = useCallback(
    async (newConvData: Omit<IConversation, "locationId">) => {
      let members: string[];
      switch (newConvData.privacyLevel) {
        case PrivacyLevel.PUBLIC:
          members = getEmployees.map(({ id }) => id);
          break;
        case PrivacyLevel.POSITIONS:
          members = getEmployees
            .filter((emp) => emp.hasAnyPosition(newConvData.positions))
            .map(({ id }) => id);
          break;
        case PrivacyLevel.PRIVATE:
          break;

        default:
          throw new Error("Unknown privacy level");
      }

      try {
        const newConvRef = await addDoc(
          collection(
            Firestore,
            "Organizations",
            location.organizationId,
            "conversations"
          ),
          {
            ...newConvData,
            createdAt: serverTimestamp(),
            createdBy: user.uid,
            locationId: location.id,
            members,
          }
        );
        await set(
          ref(
            Database,
            `conversationMessages/${location.organizationId}/${location.id}/${newConvRef.id}/firstMessage`
          ),
          {
            createdAt: dbServerTimestamp(),
            message: "START",
            systemType: "start",
            type: "system",
          }
        );
        return newConvRef.id;
      } catch (error) {
        onError(error);
        throw error;
      }
    },
    [location, location.id, getEmployees]
  );

  return (
    <ConversationsContext.Provider
      value={{
        chats,
        selectedChat,
        chatId,
        setChatId,
        canManageApp,
        canUseApp,
        createConversation,
        loading,
        error,
      }}
    >
      {typeof children === "function"
        ? children(loading, error, chats, selectedChat)
        : children}
    </ConversationsContext.Provider>
  );
}

export const useConversations = () => {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error(
      "useConversations must be used within a ConversationsProvider"
    );
  }
  return context;
};
