import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
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
import { Chat } from "../models/chat/Chat";
import { Employee } from "../models/Employee";
import { RoleAccessLevels } from "../utils/RoleAccessLevels";
import { PrivacyLevel } from "../utils/PrivacyLevel";
import { Auth, Database, Firestore } from "../firebase";
import { useLocation } from "./Location";
import { indexOf } from "lodash";
import {
  Conversation,
  ConversationFirestoreConverter,
} from "../models/chat/Conversation";
import { useEmployeesList } from "./useEmployeesList";
import {
  ref,
  serverTimestamp as dbServerTimestamp,
  set,
  update,
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
  createConversation: (newConv: Conversation) => Promise<string>;
  editConversation: (editConv: Conversation) => Promise<void>;
  deleteConversation: () => Promise<void>;
  addMembers: (addedEmployees: Employee[]) => Promise<void>;
  removeMember: (employeeId: string) => Promise<void>;
  setAppHost: (newHostUser: Employee) => Promise<void>;
  removeHost: (hostUser: Employee) => Promise<void>;
  toggleChatMute: (mute: boolean) => Promise<void>;
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
  const { location, locationId, locationAccessKey, employeeProfile } =
    useLocation();
  const [chats, loading, error] = useCollectionData<Conversation>(
    (locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER
      ? query(
          collection(
            Firestore,
            "Organizations",
            location.organizationId,
            "conversations"
          ),
          where("locationId", "==", locationId)
        )
      : query(
          collection(
            Firestore,
            "Organizations",
            location.organizationId,
            "conversations"
          ),
          where("locationId", "==", locationId),
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
      if (employeeProfile.role === "employee") {
        return true;
      }
      return Boolean(employeeProfile.locations?.[locationId] === true);
    }
    if (selectedChat.privacyLevel === PrivacyLevel.PRIVATE) {
      return (
        Array.isArray(selectedChat.members) &&
        indexOf(selectedChat.members, user.uid) > -1
      );
    }
    if (selectedChat.privacyLevel === PrivacyLevel.POSITIONS) {
      if (employeeProfile.role === "employee") {
        return selectedChat.positions?.some((pos1) =>
          locationAccessKey.pos?.includes(pos1)
        );
      }
    }
    return false;
  }, [user.uid, selectedChat, employeeProfile]);

  const createConversation = useCallback(
    async (newConvData: Conversation) => {
      let membersIds: string[] = [];
      switch (newConvData.privacyLevel) {
        case PrivacyLevel.PUBLIC:
          membersIds = getEmployees.map((emp) => emp.id);
          break;
        case PrivacyLevel.POSITIONS:
          membersIds = getEmployees
            .filter((emp) =>
              emp.locations?.[locationId]?.pos?.some((pos) =>
                newConvData.positions?.includes(pos)
              )
            )
            .map((emp) => emp.id);
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
            locationId,
            members: membersIds,
          }
        );
        await set(
          ref(
            Database,
            `conversationMessages/${location.organizationId}/${locationId}/${newConvRef.id}/firstMessage`
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
    [location, locationId]
  );

  const editConversation = useCallback(
    async (convData: Conversation) => {
      const { id } = convData;
      try {
        await setDoc(
          doc(
            Firestore,
            "Organizations",
            location.organizationId,
            "conversations",
            id
          ),
          { ...convData },
          { merge: true }
        );
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
      await deleteDoc(
        doc(
          Firestore,
          "Organizations",
          location.organizationId,
          "conversations",
          selectedChat.id
        )
      );
    } catch (error) {
      throw error;
    }
  }, [selectedChat, location, locationAccessKey]);

  const addMembers = useCallback(
    async (addedEmployees: Employee[]) => {
      if (!selectedChat || selectedChat.privacyLevel !== PrivacyLevel.PRIVATE) {
        throw new Error("Cannot add members to public or positions chat");
      }
      try {
        await updateDoc(
          doc(
            Firestore,
            "Organizations",
            location.organizationId,
            "conversations",
            selectedChat.id
          ),
          { members: arrayUnion(...addedEmployees.map((emp) => emp.id)) }
        );
      } catch (error) {
        throw error;
      }
    },
    [selectedChat, location, locationId]
  );

  const removeMember = useCallback(
    async (employeeId: string) => {
      if (!selectedChat || selectedChat.privacyLevel !== PrivacyLevel.PRIVATE) {
        throw new Error("Cannot remove members from public or positions chat");
      }
      try {
        await updateDoc(
          doc(
            Firestore,
            "Organizations",
            location.organizationId,
            "conversations",
            selectedChat.id
          ),
          { members: arrayRemove(employeeId) }
        );
      } catch (error) {
        throw error;
      }
    },
    [selectedChat, location]
  );
  const setAppHost = useCallback(
    async (newHostUser: Employee) => {
      if (!selectedChat) {
        throw new Error("No chat selected");
      }
      try {
        await updateDoc(
          doc(
            Firestore,
            "Organizations",
            location.organizationId,
            "conversations",
            selectedChat.id
          ),
          { members: arrayUnion(newHostUser.id), hostId: newHostUser.id }
        );
      } catch (error) {
        throw error;
      }
    },
    [selectedChat, location]
  );

  const removeHost = useCallback(
    async (hostUser: Employee) => {
      if (!selectedChat) {
        throw new Error("No chat selected");
      }
      const notMember =
        selectedChat.privacyLevel === PrivacyLevel.POSITIONS &&
        !selectedChat.positions?.some(
          (e) =>
            hostUser?.role === "employee" &&
            hostUser?.locations?.[locationId].pos?.includes(e)
        );

      try {
        await updateDoc(
          doc(
            Firestore,
            "Organizations",
            location.organizationId,
            "conversations",
            selectedChat.id
          ),
          { hostId: "", members: notMember && arrayRemove(hostUser.id) }
        );
      } catch (error) {
        throw error;
      }
    },
    [selectedChat, location]
  );

  const toggleChatMute = useCallback(
    async (mute: boolean) => {
      if (!selectedChat) {
        throw new Error("No chat selected");
      }
      try {
        await updateDoc(
          doc(
            Firestore,
            "Organizations",
            location.organizationId,
            "conversations",
            selectedChat.id
          ),
          { muted: mute ? arrayUnion(user.uid) : arrayRemove(user.uid) }
        );
      } catch (error) {
        throw error;
      }
    },
    [selectedChat, location, user]
  );

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
        addMembers,
        removeMember,
        setAppHost,
        removeHost,
        toggleChatMute,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export const useConversations = () => useContext(ConversationsContext);
