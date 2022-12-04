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

/**
 * The `ConversationsContextProps` interface defines the shape of the
 * object that is passed to the `ConversationsContext` provider.
 */
export interface IConversationsContextProps {
  /**
   * An optional array of `Conversation` objects representing
   * all of the conversations available in the current location.
   */
  allConversations?: Conversation[];
  /**
   * The current active conversation.
   */
  activeConversation?: Conversation;
  /**
   * The ID of the current active conversation.
   */
  activeConversationId: string;
  /**
   * A callback function that sets the active conversation ID.
   * @param conversationId The ID of the conversation to select.
   */
  setActiveConversationId: (conversationId: string) => void;
  /**
   * A boolean value indicating whether the current user
   * has permission to manage conversations.
   */
  canManage: boolean;
  /**
   * A boolean value indicating whether the current user
   * has permission to use conversations.
   */
  canUse: boolean;
  /**
   * A callback function that adds a new conversation with the given data.
   * @param newConvData The data for the new conversation.
   */
  addConversation: (
    newConvData: Omit<IConversation, "locationId">
  ) => Promise<string>;
  /**
   * A callback function that updates the active conversation with the given updates.
   * @param updates The updates to apply to the active conversation.
   */
  modifyConversation: (
    updates: PartialWithFieldValue<
      Pick<IConversation, "name" | "description" | "position">
    >
  ) => Promise<void>;
  /**
   * A boolean value indicating whether the component is currently loading data.
   */
  loading: boolean;
  /**
   * An optional error object that contains information about any error that may have occurred.
   */
  error?: Error;
}

const ConversationsContext = createContext<IConversationsContextProps>(
  {} as IConversationsContextProps
);

/**
 * The `ConversationsProviderProps` interface defines the shape of the
 * object that is passed to the `ConversationsProvider` component.
 */
interface ConversationsProviderProps {
  /**
   * The content to render inside the provider. This can
   * either be a React node or a render callback that receives the loading state,
   * error information, and conversations data as its arguments.
   */
  children:
    | ReactNode
    | ((props: {
        /**
         * {@inheritDoc IConversationsContextProps.loading}
         */
        loading: boolean;
        /**
         * {@inheritDoc IConversationsContextProps.error}
         */
        error?: Error;
        /**
         * {@inheritDoc IConversationsContextProps.allConversations}
         */
        allConversations?: Conversation[];
        /**
         * {@inheritDoc IConversationsContextProps.activeConversation}
         */
        activeConversation?: Conversation;
      }) => JSX.Element);
  /**
   * A callback function that is called when an error occurs
   * while loading or updating conversations.
   */
  onError: (error: Error | FirestoreError) => void;
}

/**
 * The `ConversationsProvider` is a React component that provides context for conversations and conversation management.
 * It uses the `useCuttinboard` hook to get information about the current user, the `useEmployeesList` hook to get a list of employees at the current location,
 * and the `useLocation` hook to get information about the current location.
 */
export function ConversationsProvider({
  children,
  onError,
}: ConversationsProviderProps) {
  const [activeConversationId, setActiveConversationId] = useState("");
  const { user } = useCuttinboard();
  const { getEmployees } = useEmployeesList();
  const { location, locationAccessKey } = useLocation();
  const [allConversations, loading, error] = useCollectionData<Conversation>(
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

  /**
   * {@inheritDoc IConversationsContextProps.activeConversation}
   */
  const activeConversation = useMemo((): Conversation | undefined => {
    if (!activeConversationId || !allConversations) {
      return undefined;
    }
    return allConversations.find(({ id }) => id === activeConversationId);
  }, [activeConversationId, allConversations]);

  /**
   * {@inheritDoc IConversationsContextProps.canManage}
   */
  const canManage = useMemo(() => {
    if (locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER) {
      // General managers can manage all conversations
      return true;
    }
    if (!activeConversation) {
      // If there is no selected conversation, then the user can't manage it
      return false;
    }
    // If the user is a manager and hosts the conversation, can manage it.
    return Boolean(
      activeConversation.iAmHost &&
        locationAccessKey.role <= RoleAccessLevels.MANAGER
    );
  }, [user.uid, activeConversation, locationAccessKey]);

  /**
   * {@inheritDoc IConversationsContextProps.canUse}
   */
  const canUse = useMemo((): boolean => {
    if (!activeConversation) {
      return false;
    }
    return activeConversation.iAmMember;
  }, [user.uid, activeConversation, location, locationAccessKey]);

  /**
   * {@inheritDoc IConversationsContextProps.addConversation}
   */
  const addConversation = useCallback(
    async (newConvData: Omit<IConversation, "locationId">) => {
      const newConversationToAdd: PartialWithFieldValue<
        IConversation & PrimaryFirestore & FirebaseSignature
      > = {
        ...newConvData,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        locationId: location.id,
      };
      // Determine which employees should be added to the conversation members list.
      let members: string[] = [];
      if (newConvData.privacyLevel === PrivacyLevel.PUBLIC) {
        // If the conversation is public, add all employees to the members list.
        members = getEmployees.map(({ id }) => id);
      } else if (
        newConvData.privacyLevel === PrivacyLevel.POSITIONS &&
        newConvData.position
      ) {
        // If the conversation is position-based, add only employees with the specified position to the members list.
        members = getEmployees
          .filter((emp) =>
            newConvData.position
              ? emp.hasAnyPosition([newConvData.position])
              : false
          )
          .map(({ id }) => id);
      }
      // Add the members to the element to add.
      newConversationToAdd.members = members;

      try {
        // Add the new conversation to the database.
        const newConvRef = await addDoc(
          collection(
            Firestore,
            "Organizations",
            location.organizationId,
            "conversations"
          ),
          newConversationToAdd
        );
        // Create and add the first message to the conversation, which is the conversation creation message itself.
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

  /**
   * {@inheritDoc IConversationsContextProps.modifyConversation}
   */
  const modifyConversation = useCallback(
    async (
      updates: PartialWithFieldValue<
        Pick<IConversation, "name" | "description" | "position">
      >
    ) => {
      if (!activeConversation) {
        return;
      }

      if (
        activeConversation.privacyLevel !== PrivacyLevel.POSITIONS || // If the conversation is not position based, we don't need to update the members list
        !updates.position || // If the position is not being updated, we don't need to update the members list
        updates.position === activeConversation.position // If the position is not being changed, we don't need to update the members list
      ) {
        await activeConversation.update(updates);
        return;
      }

      const elementToUpdate: PartialWithFieldValue<
        Pick<IConversation, "name" | "description" | "position" | "members">
      > = updates;

      // If the conversation is position based, we need to add all the employees with that position to the members list
      elementToUpdate.members = getEmployees
        .filter((emp) => emp.hasAnyPosition([updates.position as string]))
        .map(({ id }) => id);

      if (activeConversation.hosts && activeConversation.hosts?.length > 0) {
        // If the conversation has hosts, we need to add them to the members list
        elementToUpdate.members = uniq([
          ...elementToUpdate.members,
          ...activeConversation.hosts,
        ]);
      }

      await activeConversation.update(elementToUpdate);
    },
    [location, getEmployees, activeConversation]
  );

  return (
    <ConversationsContext.Provider
      value={{
        allConversations,
        activeConversation,
        activeConversationId,
        setActiveConversationId,
        canManage,
        canUse,
        addConversation,
        loading,
        error,
        modifyConversation,
      }}
    >
      {typeof children === "function"
        ? children({
            loading,
            error,
            allConversations,
            activeConversation,
          })
        : children}
    </ConversationsContext.Provider>
  );
}

/**
 * A hook to get the conversations context
 * @returns The current conversations context
 */
export const useConversations = () => {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error(
      "useConversations must be used within a ConversationsProvider"
    );
  }
  return context;
};
