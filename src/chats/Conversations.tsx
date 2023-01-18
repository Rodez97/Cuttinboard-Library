import {
  addDoc,
  collection,
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
import { DATABASE, FIRESTORE } from "../utils/firebase";
import { useCuttinboardLocation } from "../services/useCuttinboardLocation";
import {
  ref,
  serverTimestamp as dbServerTimestamp,
  set,
} from "firebase/database";
import { useCuttinboard } from "../services/useCuttinboard";
import { FirebaseSignature, PrimaryFirestore } from "../models";
import { Conversation, IConversation } from "./Conversation";
import { useEmployeesList } from "../employee";

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
    newConvData: Omit<IConversation, "locationId" | "organizationId">
  ) => Promise<string>;
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
}

/**
 * The `ConversationsProvider` is a React component that provides context for conversations and conversation management.
 * It uses the `useCuttinboard` hook to get information about the current user, the `useEmployeesList` hook to get a list of employees at the current location,
 * and the `useLocation` hook to get information about the current location.
 */
export function ConversationsProvider({
  children,
}: ConversationsProviderProps) {
  const [activeConversationId, setActiveConversationId] = useState("");
  const { user } = useCuttinboard();
  const { location, role } = useCuttinboardLocation();
  const { getEmployees } = useEmployeesList();
  const [allConversations, loading, error] = useCollectionData<Conversation>(
    (role <= RoleAccessLevels.GENERAL_MANAGER
      ? collection(FIRESTORE, "Locations", location.id, "conversations")
      : query(
          collection(FIRESTORE, "Locations", location.id, "conversations"),
          where(`members`, "array-contains", user.uid)
        )
    ).withConverter(Conversation.firestoreConverter)
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
    if (role <= RoleAccessLevels.GENERAL_MANAGER) {
      // General managers can manage all conversations
      return true;
    }
    if (!activeConversation) {
      // If there is no selected conversation, then the user can't manage it
      return false;
    }
    // If the user is a manager and hosts the conversation, can manage it.
    return activeConversation.iAmHost;
  }, [user.uid, activeConversation, role]);

  /**
   * {@inheritDoc IConversationsContextProps.canUse}
   */
  const canUse = useMemo((): boolean => {
    if (!activeConversation) {
      return false;
    }
    return activeConversation.iAmMember;
  }, [user.uid, activeConversation, location, role]);

  /**
   * {@inheritDoc IConversationsContextProps.addConversation}
   */
  const addConversation = useCallback(
    async (
      newConvData: Omit<IConversation, "locationId" | "organizationId">
    ) => {
      const newConversationToAdd: PartialWithFieldValue<
        IConversation & PrimaryFirestore & FirebaseSignature
      > = {
        ...newConvData,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        locationId: location.id,
        organizationId: location.organizationId,
      };
      if (newConvData.privacyLevel === PrivacyLevel.PUBLIC) {
        newConversationToAdd.members = getEmployees.map(({ id }) => id);
      }

      if (newConvData.privacyLevel === PrivacyLevel.POSITIONS) {
        const position = newConvData.position;
        if (!position) {
          throw new Error(
            "Cannot create a conversation with privacy level 'positions' without a position."
          );
        } else {
          newConversationToAdd.members = getEmployees
            .filter((employee) => employee.hasAnyPosition([position]))
            .map(({ id }) => id);
        }
      }

      // Add the new conversation to the database.
      const newConvRef = await addDoc(
        collection(FIRESTORE, "Locations", location.id, "conversations"),
        newConversationToAdd
      );
      // Create and add the first message to the conversation, which is the conversation creation message itself.
      await set(
        ref(
          DATABASE,
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
    },
    [location]
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
