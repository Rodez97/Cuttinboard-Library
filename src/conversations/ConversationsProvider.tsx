import { collection, query, Timestamp, where } from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { FIRESTORE } from "../utils/firebase";
import { useCuttinboardLocation } from "../cuttinboardLocation/useCuttinboardLocation";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import {
  checkConversationMember,
  checkIfUserIsHost,
  conversationConverter,
} from "./conversationUtils";
import { collectionData } from "rxfire/firestore";
import { nanoid } from "@reduxjs/toolkit";
import {
  addConversationHostThunk,
  addConversationMemberThunk,
  conversationsSelector,
  createConversationThunk,
  deleteConversationThunk,
  removeConversationHostThunk,
  removeConversationMemberThunk,
  selectConversationsError,
  selectConversationsLoading,
  selectConversationsLoadingStatus,
  selectSelectedConversation,
  setConversations,
  setConversationsError,
  setConversationsLoading,
  setSelectedConversation,
  toggleMuteConversationThunk,
  updateConversationThunk,
} from "./conversations.slice";
import {
  useAppDispatch,
  useAppSelector,
  useAppThunkDispatch,
} from "../reduxStore/utils";
import { defaultIfEmpty } from "rxjs";
import {
  checkEmployeePositions,
  IConversation,
  IEmployee,
  PrivacyLevel,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import { employeesSelectors } from "../employee";

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
  activeConversation: IConversation | null | undefined;
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
    newConvData: Omit<
      IConversation,
      | "locationId"
      | "organizationId"
      | "id"
      | "refPath"
      | "createdAt"
      | "updatedAt"
    >
  ) => string;
  toggleMuteConversation: (conversation: IConversation) => void;
  addConversationHost: (conversation: IConversation, host: IEmployee) => void;
  removeConversationHost: (
    conversation: IConversation,
    host: IEmployee
  ) => void;
  addConversationMembers: (
    conversation: IConversation,
    newMembers: IEmployee[]
  ) => void;
  removeConversationMember: (
    conversation: IConversation,
    membersToRemove: IEmployee[]
  ) => void;
  updateConversation: (
    conversation: IConversation,
    conversationUpdates: {
      name?: string;
      description?: string;
    }
  ) => void;
  deleteConversation: (conversation: IConversation) => void;
  selectConversation: (conversationId: string) => void;
  loading: boolean;
  error: string | undefined;
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
}

/**
 * The `ConversationsProvider` is a React component that provides context for conversations and conversation management.
 * It uses the `useCuttinboard` hook to get information about the current user, the `useEmployeesList` hook to get a list of employees at the current location,
 * and the `useLocation` hook to get information about the current location.
 */
export function ConversationsProvider({
  children,
}: ConversationsProviderProps) {
  const { user, onError } = useCuttinboard();
  const { location, role } = useCuttinboardLocation();
  const dispatch = useAppDispatch();
  const thunkDispatch = useAppThunkDispatch();
  const employees = useAppSelector(employeesSelectors.selectAll);
  const conversations = useAppSelector(conversationsSelector.selectAll);
  const activeConversation = useAppSelector(selectSelectedConversation);
  const loading = useAppSelector(selectConversationsLoading);
  const loadingStatus = useAppSelector(selectConversationsLoadingStatus);
  const error = useAppSelector(selectConversationsError);

  useEffect(() => {
    if (loadingStatus !== "succeeded") {
      dispatch(setConversationsLoading("pending"));
    }

    const queryRef = (
      role <= RoleAccessLevels.GENERAL_MANAGER
        ? collection(FIRESTORE, "Locations", location.id, "conversations")
        : query(
            collection(FIRESTORE, "Locations", location.id, "conversations"),
            where(`members`, "array-contains", user.uid)
          )
    ).withConverter(conversationConverter);

    const subscription = collectionData(queryRef)
      .pipe(defaultIfEmpty<IConversation[], IConversation[]>([]))
      .subscribe({
        next: (conversations) => {
          dispatch(setConversations(conversations));
        },
        error: (error) => {
          dispatch(setConversationsError(error.message));
          onError(error);
        },
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [role, user.uid, location.id]);

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
    return checkIfUserIsHost(activeConversation);
  }, [activeConversation, role]);

  /**
   * {@inheritDoc IConversationsContextProps.canUse}
   */
  const canUse = useMemo((): boolean => {
    if (!activeConversation) {
      return false;
    }
    return checkConversationMember(activeConversation);
  }, [activeConversation]);

  /**
   * {@inheritDoc IConversationsContextProps.addConversation}
   */
  const addConversation = useCallback(
    (
      newConvData: Omit<
        IConversation,
        | "locationId"
        | "organizationId"
        | "id"
        | "refPath"
        | "createdAt"
        | "updatedAt"
      >
    ) => {
      const newConvId = nanoid();
      const newConversationToAdd: IConversation = {
        ...newConvData,
        createdAt: Timestamp.now().toMillis(),
        locationId: location.id,
        organizationId: location.organizationId,
        id: newConvId,
        refPath: `Locations/${location.id}/conversations/${newConvId}`,
      };

      if (newConvData.privacyLevel === PrivacyLevel.PUBLIC) {
        newConversationToAdd.members = employees.map(({ id }) => id);
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
            .map(({ id }) => id);
        }
      }

      thunkDispatch(createConversationThunk(newConversationToAdd)).catch(
        onError
      );

      return newConvId;
    },
    [location, employees]
  );

  const toggleMuteConversation = useCallback(
    (conversation: IConversation) => {
      thunkDispatch(toggleMuteConversationThunk(conversation)).catch(onError);
    },
    [thunkDispatch]
  );

  const addConversationHost = useCallback(
    (conversation: IConversation, host: IEmployee) => {
      thunkDispatch(addConversationHostThunk(conversation, host)).catch(
        onError
      );
    },
    [thunkDispatch]
  );

  const removeConversationHost = useCallback(
    (conversation: IConversation, host: IEmployee) => {
      thunkDispatch(removeConversationHostThunk(conversation, host)).catch(
        onError
      );
    },
    [thunkDispatch]
  );

  const addConversationMembers = useCallback(
    (conversation: IConversation, newMembers: IEmployee[]) => {
      thunkDispatch(addConversationMemberThunk(conversation, newMembers)).catch(
        onError
      );
    },
    [thunkDispatch]
  );

  const removeConversationMember = useCallback(
    (conversation: IConversation, membersToRemove: IEmployee[]) => {
      thunkDispatch(
        removeConversationMemberThunk(conversation, membersToRemove)
      ).catch(onError);
    },
    [thunkDispatch]
  );

  const updateConversation = useCallback(
    (
      conversation: IConversation,
      conversationUpdates: {
        name?: string;
        description?: string;
      }
    ) => {
      thunkDispatch(
        updateConversationThunk(conversation, conversationUpdates)
      ).catch(onError);
    },
    [thunkDispatch]
  );

  const deleteConversation = useCallback(
    (conversation: IConversation) => {
      thunkDispatch(deleteConversationThunk(conversation)).catch(onError);
    },
    [thunkDispatch]
  );

  const selectConversation = useCallback(
    (conversationId: string) => {
      dispatch(setSelectedConversation(conversationId));
    },
    [thunkDispatch]
  );

  return (
    <ConversationsContext.Provider
      value={{
        activeConversation,
        canManage,
        canUse,
        addConversation,
        conversations,
        toggleMuteConversation,
        addConversationHost,
        removeConversationHost,
        addConversationMembers,
        removeConversationMember,
        updateConversation,
        deleteConversation,
        selectConversation,
        loading,
        error,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}
