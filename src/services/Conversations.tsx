import {
  addDoc,
  collection,
  FirestoreError,
  PartialWithFieldValue,
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
import { FirebaseSignature, PrimaryFirestore } from "../models";
import { uniq } from "lodash";

interface ConversationsContextProps {
  conversations?: Conversation[];
  selectedConversation?: Conversation;
  conversationId: string;
  setConversationId: (convId: string) => void;
  canManage: boolean;
  canUse: boolean;
  createConversation: (
    newConvData: Omit<IConversation, "locationId">
  ) => Promise<string>;
  updateConversation: (
    updates: PartialWithFieldValue<
      Pick<IConversation, "name" | "description" | "position">
    >
  ) => Promise<void>;
  loading: boolean;
  error?: Error;
}

const ConversationsContext = createContext<ConversationsContextProps>(
  {} as ConversationsContextProps
);

interface ConversationsProviderProps {
  children:
    | ReactNode
    | ((props: {
        loading: boolean;
        error?: Error;
        conversations?: Conversation[];
        selectedConversation?: Conversation;
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
          where(`members`, "array-contains", user.uid)
        )
    ).withConverter(Conversation.Converter)
  );

  const selectedConversation = useMemo((): Conversation | undefined => {
    if (!conversationId || !conversations) {
      return undefined;
    }
    return conversations.find(({ id }) => id === conversationId);
  }, [conversationId, conversations]);

  const canManage = useMemo(() => {
    if (locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER) {
      // General managers can manage all conversations
      return true;
    }
    if (!selectedConversation) {
      // If there is no selected conversation, then the user can't manage it
      return false;
    }
    // If the user is a manager and hosts the conversation, can manage it.
    return Boolean(
      selectedConversation.iAmHost &&
        locationAccessKey.role <= RoleAccessLevels.MANAGER
    );
  }, [user.uid, selectedConversation, locationAccessKey]);

  const canUse = useMemo((): boolean => {
    if (!selectedConversation) {
      return false;
    }
    return selectedConversation.iAmMember;
  }, [user.uid, selectedConversation, location, locationAccessKey]);

  const createConversation = useCallback(
    async (newConvData: Omit<IConversation, "locationId">) => {
      const elementToAdd: PartialWithFieldValue<
        IConversation & PrimaryFirestore & FirebaseSignature
      > = {
        ...newConvData,
        createdAt: serverTimestamp(),
        createdBy: user?.uid,
        locationId: location.id,
      };
      if (newConvData.privacyLevel === PrivacyLevel.PUBLIC) {
        // If the conversation is public, we need to add all the employees to the members list
        elementToAdd.members = getEmployees.map(({ id }) => id);
      }
      if (
        newConvData.privacyLevel === PrivacyLevel.POSITIONS &&
        newConvData.position
      ) {
        // If the conversation is position based, we need to add all the employees with that position to the members list
        elementToAdd.members = getEmployees
          .filter((emp) =>
            newConvData.position
              ? emp.hasAnyPosition([newConvData.position])
              : false
          )
          .map(({ id }) => id);
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
    [location, getEmployees]
  );

  const updateConversation = useCallback(
    async (
      updates: PartialWithFieldValue<
        Pick<IConversation, "name" | "description" | "position">
      >
    ) => {
      if (!selectedConversation) {
        return;
      }

      if (
        selectedConversation.privacyLevel !== PrivacyLevel.POSITIONS || // If the conversation is not position based, we don't need to update the members list
        !updates.position || // If the position is not being updated, we don't need to update the members list
        updates.position === selectedConversation.position // If the position is not being changed, we don't need to update the members list
      ) {
        await selectedConversation.update(updates);
        return;
      }

      const elementToUpdate: PartialWithFieldValue<
        Pick<IConversation, "name" | "description" | "position" | "members">
      > = updates;

      // If the conversation is position based, we need to add all the employees with that position to the members list
      elementToUpdate.members = getEmployees
        .filter((emp) => emp.hasAnyPosition([updates.position as string]))
        .map(({ id }) => id);

      if (
        selectedConversation.hosts &&
        selectedConversation.hosts?.length > 0
      ) {
        // If the conversation has hosts, we need to add them to the members list
        elementToUpdate.members = uniq([
          ...elementToUpdate.members,
          ...selectedConversation.hosts,
        ]);
      }

      await selectedConversation.update(elementToUpdate);
    },
    [location, getEmployees, selectedConversation]
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
        updateConversation,
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
