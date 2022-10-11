import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
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
import { Employee } from "../models/Employee";
import { RoleAccessLevels } from "../utils/RoleAccessLevels";
import { PrivacyLevel } from "../utils/PrivacyLevel";
import { Auth, Database, Firestore } from "../firebase";
import { useLocation } from "./Location";
import {
  Conversation,
  ConversationFirestoreConverter,
  IConversation,
} from "../models/chat/Conversation";
import { useEmployeesList } from "./useEmployeesList";
import {
  ref,
  serverTimestamp as dbServerTimestamp,
  set,
} from "firebase/database";

interface ConversationsContextProps {
  openNew: () => void;
  openEdit: (app: Conversation) => void;
  chats: Conversation[];
  selectedChat?: Conversation;
  chatId: string;
  setChatId: (chtId: string) => void;
  canManageApp: boolean;
  canUseApp: boolean;
  createConversation: (newConv: IConversation) => Promise<string>;
  editConversation: (editConv: Conversation) => Promise<void>;
  deleteConversation: () => Promise<void>;
}

const ConversationsContext = createContext<ConversationsContextProps>(
  {} as ConversationsContextProps
);

interface ConversationsProviderProps {
  children: ReactNode;
  LoadingElement: JSX.Element;
  ErrorElement: (error: Error) => JSX.Element;
  openNew: () => void;
  openEdit: (conversation: Conversation) => void;
}

export function ConversationsProvider({
  children,
  LoadingElement,
  ErrorElement,
  openNew,
  openEdit,
}: ConversationsProviderProps) {
  const [chatId, setChatId] = useState("");
  const [user] = useState(Auth.currentUser);
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
    ).withConverter(ConversationFirestoreConverter)
  );

  const selectedChat = useMemo((): Conversation | null => {
    if (!chatId) {
      return null;
    }
    return chats?.find(({ id }) => id === chatId);
  }, [chatId, chats]);

  const canManageApp = useMemo(() => {
    return Boolean(
      selectedChat?.hostId === user.uid ||
        locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER
    );
  }, [user.uid, selectedChat, locationAccessKey]);

  const canUseApp = useMemo((): boolean => {
    if (!selectedChat) {
      return false;
    }
    if (selectedChat?.hostId === user.uid) {
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
  }, [user.uid, selectedChat, location]);

  const createConversation = useCallback(
    async (newConvData: IConversation) => {
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
        throw error;
      }
    },
    [location, location.id]
  );

  const editConversation = useCallback(
    async (convData: Conversation) => {
      const { docRef } = convData;
      try {
        await setDoc(docRef, { ...convData }, { merge: true });
      } catch (error) {
        throw error;
      }
    },
    [location]
  );

  const deleteConversation = useCallback(async () => {
    if (!selectedChat) {
      throw new Error("No chat selected");
    }
    if (locationAccessKey.role > RoleAccessLevels.GENERAL_MANAGER) {
      throw new Error("You do not have permission to delete this conversation");
    }
    setChatId("");
    try {
      await deleteDoc(selectedChat.docRef);
    } catch (error) {
      throw error;
    }
  }, [selectedChat, location, locationAccessKey]);

  if (loading) {
    return LoadingElement;
  }
  if (error) {
    return ErrorElement(error);
  }
  return (
    <ConversationsContext.Provider
      value={{
        openNew,
        openEdit,
        chats,
        selectedChat,
        chatId,
        setChatId,
        canManageApp,
        canUseApp,
        createConversation,
        editConversation,
        deleteConversation,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export const useConversations = () => useContext(ConversationsContext);
