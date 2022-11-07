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
import { Conversation } from "../models/chat/Conversation";
import { useEmployeesList } from "./useEmployeesList";
import {
  ref,
  serverTimestamp as dbServerTimestamp,
  set,
} from "firebase/database";
import { useCuttinboard } from "./Cuttinboard";
import { IGenericModule } from "../models";

interface ConversationsContextProps {
  conversations: Conversation[];
  selectedConversation?: Conversation;
  conversationId: string;
  setConversationId: (convId: string) => void;
  canManage: boolean;
  canUse: boolean;
  createConversation: (
    newConvData: Omit<IGenericModule, "locationId">
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
    | ((props: {
        loading: boolean;
        error: Error;
        conversations: Conversation[];
        selectedConversation: Conversation | undefined;
      }) => JSX.Element);
  onError: (error: Error | FirestoreError) => void;
}

export function ConversationsProvider({
  children,
  onError,
}: ConversationsProviderProps) {
  const [conversationId, setConversationId] = useState("");
  const { user } = useCuttinboard();
  const { getEmployees } = useEmployeesList();
  const { location, locationAccessKey } = useLocation();
  const [conversations, loading, error] = useCollectionData<Conversation>(
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
          where(`accessTags`, "array-contains-any", [
            user.uid,
            `hostId_${user.uid}`,
            "pl_public",
            ...(locationAccessKey.pos ?? []),
          ])
        )
    ).withConverter(Conversation.Converter)
  );

  const selectedConversation = useMemo((): Conversation | null => {
    if (!conversationId) {
      return null;
    }
    return conversations?.find(({ id }) => id === conversationId);
  }, [conversationId, conversations]);

  const canManage = useMemo(() => {
    return Boolean(
      selectedConversation?.amIhost ||
        locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER
    );
  }, [user.uid, selectedConversation, locationAccessKey]);

  const canUse = useMemo((): boolean => {
    if (!selectedConversation) {
      return false;
    }
    if (selectedConversation.amIhost) {
      return true;
    }
    if (selectedConversation.privacyLevel === PrivacyLevel.PUBLIC) {
      return location.members.indexOf(user.uid) !== -1;
    }
    if (selectedConversation.privacyLevel === PrivacyLevel.PRIVATE) {
      return Boolean(selectedConversation.members?.indexOf(user.uid) !== -1);
    }
    if (selectedConversation.privacyLevel === PrivacyLevel.POSITIONS) {
      return locationAccessKey.pos?.includes(selectedConversation.position);
    }
    return false;
  }, [user.uid, selectedConversation, location, locationAccessKey]);

  const createConversation = useCallback(
    async (newConvData: Omit<IGenericModule, "locationId">) => {
      const elementToAdd = {
        ...newConvData,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        locationId: location.id,
      };
      if (newConvData.privacyLevel === PrivacyLevel.PUBLIC) {
        elementToAdd.accessTags = ["pl_public"];
      }
      if (
        newConvData.privacyLevel === PrivacyLevel.POSITIONS &&
        elementToAdd.accessTags.length > 1
      ) {
        elementToAdd.accessTags = [elementToAdd.accessTags[0]];
      }

      try {
        const newConvRef = await addDoc(
          collection(
            Firestore,
            "Organizations",
            location.organizationId,
            "conversations"
          ),
          elementToAdd
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
        conversations,
        selectedConversation,
        conversationId,
        setConversationId,
        canManage,
        canUse,
        createConversation,
        loading,
        error,
      }}
    >
      {typeof children === "function"
        ? children({ loading, error, conversations, selectedConversation })
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
