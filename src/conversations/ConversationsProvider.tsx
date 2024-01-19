import {
  deleteDoc,
  doc,
  PartialWithFieldValue,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  checkConversationMember,
  removeConversationMembers,
  toggleMuteConversation,
} from "./conversationUtils";
import {
  checkEmployeePositions,
  getEmployeeFullName,
  IConversation,
  IEmployee,
  ILocation,
  PrivacyLevel,
  RoleAccessLevels,
} from "@rodez97/types-helpers";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { FIRESTORE } from "../utils/firebase";
import { useConversationsData } from "./useConversationsData";
import { nanoid } from "nanoid";

/**
 * The `ConversationsContextProps` interface defines the shape of the
 * object that is passed to the `ConversationsContext` provider.
 */
export interface IConversationsContextProps {
  /**
   * An optional array of `Conversation` objects representing
   * all of the conversations available in the current location.
   */
  conversations: IConversation[];
  /**
   * The current active conversation.
   */
  activeConversation: IConversation | undefined;
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
    newConvData: {
      name: string;
      description?: string;
      privacyLevel: PrivacyLevel;
      position?: string;
    },
    location: ILocation,
    employees: IEmployee[],
    privateInitialMembers?: IEmployee[]
  ) => Promise<void>;
  toggleConversationMuted: (conversation: IConversation) => Promise<void>;
  addMembers: (
    conversation: IConversation,
    newMembers: IEmployee[]
  ) => Promise<void>;
  removeMembers: (
    conversation: IConversation,
    membersToRemove: IEmployee[]
  ) => Promise<void>;
  updateConversation: (
    conversation: IConversation,
    conversationUpdates: {
      name?: string;
      description?: string;
    }
  ) => Promise<void>;
  deleteConversation: (conversation: IConversation) => Promise<void>;
  selectConversationId: (conversationId: string) => void;
  loading: boolean;
  error: Error | undefined;
}

export const ConversationsContext = createContext<IConversationsContextProps>(
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
  children: ReactNode;
  locationId?: string;
}

/**
 * The `ConversationsProvider` is a React component that provides context for conversations and conversation management.
 * It uses the `useCuttinboard` hook to get information about the current user, the `useEmployeesList` hook to get a list of employees at the current location,
 * and the `useLocation` hook to get information about the current location.
 */
export function ConversationsProvider({
  children,
  locationId,
}: ConversationsProviderProps) {
  const { onError, organizationKey } = useCuttinboard();
  const [selectedConversationId, selectConversationId] = useState<string>();
  const { loading, error, conversations } = useConversationsData(locationId);

  const activeConversation = useMemo(() => {
    return selectedConversationId
      ? conversations.find((conv) => conv.id === selectedConversationId)
      : undefined;
  }, [conversations, selectedConversationId]);

  /**
   * {@inheritDoc IConversationsContextProps.canManage}
   */
  const canManage = useMemo(() => {
    if (!organizationKey || !activeConversation) {
      return false;
    }
    return (
      organizationKey.role <= RoleAccessLevels.GENERAL_MANAGER &&
      activeConversation.locationId === organizationKey.locId
    );
  }, [activeConversation, organizationKey]);

  /**
   * {@inheritDoc IConversationsContextProps.canUse}
   */
  const canUse = useMemo((): boolean => {
    if (!activeConversation) {
      return false;
    }
    return checkConversationMember(activeConversation);
  }, [activeConversation]);

  const addConversation = useCallback(
    async (
      newConvData: {
        name: string;
        description?: string;
        privacyLevel: PrivacyLevel;
        position?: string;
      },
      location: ILocation,
      employees: IEmployee[],
      privateInitialMembers?: IEmployee[]
    ) => {
      const newConvId = nanoid();
      const newConversationToAdd: IConversation = {
        ...newConvData,
        createdAt: Timestamp.now().toMillis(),
        locationId: location.id,
        locationName: location.name,
        organizationId: location.organizationId,
        members: {},
        id: newConvId,
      };

      if (newConvData.privacyLevel === PrivacyLevel.PUBLIC) {
        newConversationToAdd.members = employees.reduce<
          IConversation["members"]
        >(
          (acc, employee) => ({
            ...acc,
            [employee.id]: {
              name: getEmployeeFullName(employee),
              avatar: employee.avatar,
              muted: false,
            },
          }),
          {}
        );
      }

      if (newConvData.privacyLevel === PrivacyLevel.POSITIONS) {
        const position = newConvData.position;
        if (!position) {
          throw new Error(
            "Cannot create a conversation with privacy level 'positions' without a position."
          );
        } else {
          newConversationToAdd.members = employees
            .filter((employee) => checkEmployeePositions(employee, [position]))
            .reduce<IConversation["members"]>(
              (acc, employee) => ({
                ...acc,
                [employee.id]: {
                  name: getEmployeeFullName(employee),
                  avatar: employee.avatar,
                  muted: false,
                },
              }),
              {}
            );
        }
      }

      if (
        newConvData.privacyLevel === PrivacyLevel.PRIVATE &&
        privateInitialMembers
      ) {
        newConversationToAdd.members = privateInitialMembers?.reduce<
          IConversation["members"]
        >(
          (acc, employee) => ({
            ...acc,
            [employee.id]: {
              name: getEmployeeFullName(employee),
              avatar: employee.avatar,
              muted: false,
            },
          }),
          {}
        );
      }

      try {
        await setDoc(
          doc(FIRESTORE, "conversations", newConversationToAdd.id),
          newConversationToAdd
        );
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const toggleConversationMuted = useCallback(
    async (conversation: IConversation) => {
      const updates = toggleMuteConversation(conversation);
      if (!updates) {
        return;
      }
      try {
        await setDoc(
          doc(FIRESTORE, "conversations", conversation.id),
          updates,
          { merge: true }
        );
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const addMembers = useCallback(
    async (conversation: IConversation, newMembers: IEmployee[]) => {
      if (conversation.privacyLevel === PrivacyLevel.PUBLIC) {
        throw new Error(
          "Cannot add members to a public conversation. Add them to the location instead."
        );
      }

      let guestsList: string[] = [];

      // If the conversations is by positions, split th new members into those that are eligible and those that are not.
      if (conversation.privacyLevel === PrivacyLevel.POSITIONS) {
        const position = conversation.position;
        if (!position) {
          throw new Error(
            "Cannot add members to a conversation with privacy level 'positions' without a position."
          );
        } else {
          const eligibleMembers = newMembers.filter((employee) =>
            checkEmployeePositions(employee, [position])
          );
          const guests = newMembers.filter(
            (employee) => !eligibleMembers.includes(employee)
          );
          if (guests.length > 0) {
            guestsList = guests.map((guest) => guest.id);
          }
        }
      }

      const firestoreUpdates: PartialWithFieldValue<IConversation> = {
        members: {},
        guests: guestsList,
      };

      newMembers.forEach((member) => {
        firestoreUpdates.members = {
          ...firestoreUpdates.members,
          [member.id]: {
            name: getEmployeeFullName(member),
            avatar: member.avatar,
            muted: false,
          },
        };
      });

      try {
        await setDoc(
          doc(FIRESTORE, "conversations", conversation.id),
          firestoreUpdates,
          { merge: true }
        );
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const removeMembers = useCallback(
    async (conversation: IConversation, membersToRemove: IEmployee[]) => {
      if (conversation.privacyLevel === PrivacyLevel.PUBLIC) {
        throw new Error(
          "Cannot remove members from a public conversation. Remove them from the location instead."
        );
      }

      if (conversation.privacyLevel === PrivacyLevel.POSITIONS) {
        const position = conversation.position;
        if (!position) {
          throw new Error(
            "Cannot remove members from a conversation with privacy level 'positions' without a position."
          );
        } else if (
          membersToRemove.some((member) =>
            checkEmployeePositions(member, [position])
          )
        ) {
          throw new Error(
            "Cannot remove members from a conversation with privacy level 'positions' that have the same position."
          );
        }
      }

      const firestoreUpdates = removeConversationMembers(membersToRemove);

      try {
        await setDoc(
          doc(FIRESTORE, "conversations", conversation.id),
          firestoreUpdates,
          { merge: true }
        );
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const updateConversation = useCallback(
    async (
      conversation: IConversation,
      conversationUpdates: {
        name?: string;
        description?: string;
      }
    ) => {
      try {
        await setDoc(
          doc(FIRESTORE, "conversations", conversation.id),
          conversationUpdates,
          { merge: true }
        );
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const deleteConversation = useCallback(
    async (conversation: IConversation) => {
      try {
        await deleteDoc(doc(FIRESTORE, "conversations", conversation.id));
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  return (
    <ConversationsContext.Provider
      value={{
        activeConversation,
        canManage,
        canUse,
        addConversation,
        conversations,
        toggleConversationMuted,
        addMembers,
        removeMembers,
        updateConversation,
        deleteConversation,
        selectConversationId,
        loading,
        error,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}
