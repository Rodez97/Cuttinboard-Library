import {
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
  Reducer,
} from "@reduxjs/toolkit";
import { ref } from "firebase/database";
import {
  deleteDoc,
  doc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { AppThunk, RootState } from "../reduxStore/utils";
import { AUTH, DATABASE, FIRESTORE } from "../utils";
import {
  addMessageThunk,
  deleteMessageThunk,
} from "../messages/messages.slice";
import {
  addConversationHost,
  addConversationMembers,
  conversationConverter,
  removeConversationHost,
  removeConversationMembers,
  toggleMuteConversation,
} from "./conversationUtils";
import { LoadingStatus } from "../models";
import {
  IConversation,
  IEmployee,
  IMessage,
  PrivacyLevel,
} from "@cuttinboard-solutions/types-helpers";

export interface ConversationsState extends LoadingStatus {
  selectedConversationId?: string | undefined;
}

const conversationsAdapter = createEntityAdapter<IConversation>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export const createConversationThunk =
  (newConversation: IConversation): AppThunk<Promise<void>> =>
  async (dispatch) => {
    if (!AUTH.currentUser) {
      throw new Error("User not logged in");
    }
    const dmRef = doc(FIRESTORE, newConversation.refPath);

    const firstMessage: IMessage = {
      createdAt: Timestamp.now().toMillis(),
      text: "START",
      systemType: "start",
      sender: {
        id: AUTH.currentUser.uid,
        name: AUTH.currentUser.displayName ?? "Unknown User",
      },
      id: "firstMessage",
      messageRefUrl: ref(
        DATABASE,
        `conversationMessages/${newConversation.organizationId}/${newConversation.locationId}/${newConversation.id}/firstMessage`
      ).toString(),
    };

    dispatch(addConversation(newConversation));
    dispatch(addMessageThunk(newConversation.id, false, firstMessage));
    try {
      await setDoc(dmRef, newConversation);
    } catch (error) {
      dispatch(removeConversation(newConversation.id));
      dispatch(deleteMessageThunk(newConversation.id, firstMessage));
      throw error;
    }
  };

export const toggleMuteConversationThunk =
  (conversation: IConversation): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const docRef = doc(FIRESTORE, conversation.refPath).withConverter(
      conversationConverter
    );
    const updates = toggleMuteConversation(conversation);
    if (!updates) {
      return;
    }
    const { serverUpdates, localUpdates } = updates;
    dispatch(upsertConversation(localUpdates));
    try {
      await updateDoc(docRef, serverUpdates);
    } catch (error) {
      dispatch(upsertConversation(conversation));
      throw error;
    }
  };

export const addConversationHostThunk =
  (conversation: IConversation, host: IEmployee): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const docRef = doc(FIRESTORE, conversation.refPath).withConverter(
      conversationConverter
    );
    const { serverUpdates, localUpdates } = addConversationHost(
      conversation,
      host
    );
    dispatch(upsertConversation(localUpdates));
    try {
      await updateDoc(docRef, serverUpdates);
    } catch (error) {
      dispatch(upsertConversation(conversation));
      throw error;
    }
  };

export const removeConversationHostThunk =
  (conversation: IConversation, host: IEmployee): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const docRef = doc(FIRESTORE, conversation.refPath).withConverter(
      conversationConverter
    );
    const { serverUpdates, localUpdates } = removeConversationHost(
      conversation,
      host
    );
    dispatch(upsertConversation(localUpdates));
    try {
      await updateDoc(docRef, serverUpdates);
    } catch (error) {
      dispatch(upsertConversation(conversation));
      throw error;
    }
  };

export const addConversationMemberThunk =
  (
    conversation: IConversation,
    newMembers: IEmployee[]
  ): AppThunk<Promise<void>> =>
  async (dispatch) => {
    if (conversation.privacyLevel !== PrivacyLevel.PRIVATE) {
      throw new Error(
        "Cannot add members to a non-private conversation. This conversation's privacy level is: " +
          conversation.privacyLevel
      );
    }
    const docRef = doc(FIRESTORE, conversation.refPath).withConverter(
      conversationConverter
    );

    const { serverUpdates, localUpdates } = addConversationMembers(
      conversation,
      newMembers
    );

    dispatch(upsertConversation(localUpdates));

    try {
      await updateDoc(docRef, serverUpdates);
    } catch (error) {
      dispatch(upsertConversation(conversation));
      throw error;
    }
  };

export const removeConversationMemberThunk =
  (
    conversation: IConversation,
    membersToRemove: IEmployee[]
  ): AppThunk<Promise<void>> =>
  async (dispatch) => {
    if (conversation.privacyLevel !== PrivacyLevel.PRIVATE) {
      throw new Error(
        "Cannot add members to a non-private conversation. This conversation's privacy level is: " +
          conversation.privacyLevel
      );
    }
    const docRef = doc(FIRESTORE, conversation.refPath).withConverter(
      conversationConverter
    );

    const { serverUpdates, localUpdates } = removeConversationMembers(
      conversation,
      membersToRemove
    );

    dispatch(upsertConversation(localUpdates));

    try {
      await updateDoc(docRef, serverUpdates);
    } catch (error) {
      dispatch(upsertConversation(conversation));
      throw error;
    }
  };

export const updateConversationThunk =
  (
    conversation: IConversation,
    conversationUpdates: {
      name?: string;
      description?: string;
    }
  ): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const docRef = doc(FIRESTORE, conversation.refPath).withConverter(
      conversationConverter
    );

    dispatch(
      updateConversation({
        id: conversation.id,
        changes: conversationUpdates,
      })
    );

    try {
      await updateDoc(docRef, conversationUpdates);
    } catch (error) {
      dispatch(upsertConversation(conversation));
      throw error;
    }
  };

export const deleteConversationThunk =
  (conversation: IConversation): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const docRef = doc(FIRESTORE, conversation.refPath).withConverter(
      conversationConverter
    );

    dispatch(removeConversation(conversation.id));

    try {
      await deleteDoc(docRef);
    } catch (error) {
      dispatch(addConversation(conversation));
      throw error;
    }
  };

const conversationsSlice = createSlice({
  name: "conversations",
  initialState: conversationsAdapter.getInitialState<ConversationsState>({
    loading: "idle",
  }),
  reducers: {
    setConversations(state, action: PayloadAction<IConversation[]>) {
      if (state.loading === "failed") {
        state.error = undefined;
      }
      state.loading = "succeeded";
      conversationsAdapter.setAll(state, action.payload);
    },
    setSelectedConversation(state, action: PayloadAction<string>) {
      state.selectedConversationId = action.payload;
    },
    addConversation: conversationsAdapter.addOne,
    removeConversation: conversationsAdapter.removeOne,
    updateConversation: conversationsAdapter.updateOne,
    upsertConversation: conversationsAdapter.upsertOne,
    setConversationsError(state, action: PayloadAction<string>) {
      state.loading = "failed";
      state.error = action.payload;
    },
    setConversationsLoading(
      state,
      action: PayloadAction<LoadingStatus["loading"]>
    ) {
      state.loading = action.payload;
    },
  },
});

export const {
  setConversations,
  setSelectedConversation,
  addConversation,
  removeConversation,
  updateConversation,
  upsertConversation,
  setConversationsError,
  setConversationsLoading,
} = conversationsSlice.actions;

type ConversationsActions =
  | ReturnType<typeof setConversations>
  | ReturnType<typeof setSelectedConversation>
  | ReturnType<typeof addConversation>
  | ReturnType<typeof removeConversation>
  | ReturnType<typeof updateConversation>
  | ReturnType<typeof upsertConversation>
  | ReturnType<typeof setConversationsError>
  | ReturnType<typeof setConversationsLoading>;

export const conversationsReducer: Reducer<
  EntityState<IConversation> & ConversationsState,
  ConversationsActions
> = conversationsSlice.reducer;

export const conversationsSelector =
  conversationsAdapter.getSelectors<RootState>((state) => state.conversations);

export const conversationsSingleSelector = conversationsAdapter.getSelectors();

export const selectSelectedConversationId = (state: RootState) =>
  state.conversations.selectedConversationId;

export const selectSelectedConversation = createSelector(
  (state: RootState) => state.conversations,
  (conversations) => {
    const selectedConversationId = conversations.selectedConversationId;
    if (!selectedConversationId) {
      return null;
    }
    return conversationsSingleSelector.selectById(
      conversations,
      selectedConversationId
    );
  }
);

export const selectConversationsLoading = (state: RootState) =>
  state.conversations.loading === "pending" ||
  state.conversations.loading === "idle";

export const selectConversationsLoadingStatus = (state: RootState) =>
  state.conversations.loading;

export const selectConversationsError = (state: RootState) =>
  state.conversations.error;
