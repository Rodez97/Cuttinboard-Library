import {
  AnyAction,
  createEntityAdapter,
  createSelector,
  createSlice,
  Dispatch,
  EntityState,
  PayloadAction,
  Reducer,
  ThunkDispatch,
} from "@reduxjs/toolkit";
import { ref, set as DatabaseSet } from "firebase/database";
import {
  arrayRemove,
  arrayUnion,
  doc,
  PartialWithFieldValue,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { useDispatch } from "react-redux";
import { AUTH, DATABASE, FIRESTORE } from "../utils";
import {
  addMessageThunk,
  deleteMessageThunk,
} from "../messages/messages.slice";
import { AppThunk, RootState } from "../reduxStore/utils";
import { LoadingStatus } from "../models";
import { set } from "lodash";
import {
  checkDmMuted,
  IDirectMessage,
  IMessage,
} from "@cuttinboard-solutions/types-helpers";

export interface DirectMessagesState extends LoadingStatus {
  selectedDirectMessageId?: undefined | string;
}

const directMessagesAdapter = createEntityAdapter<IDirectMessage>({
  sortComparer: (a, b) => {
    if (a.recentMessage && b.recentMessage) {
      return b.recentMessage - a.recentMessage;
    } else if (a.recentMessage) {
      return -1;
    } else if (b.recentMessage) {
      return 1;
    } else {
      return 0;
    }
  },
});

export const createDmThunk =
  (newDM: IDirectMessage): AppThunk<Promise<void>> =>
  async (dispatch) => {
    if (!AUTH.currentUser) {
      throw new Error("You must be logged in to create a DM.");
    }
    const dmRef = doc(FIRESTORE, newDM.refPath);

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
        `directMessages/${newDM.id}/firstMessage`
      ).toString(),
    };

    dispatch(addDirectMessage(newDM));
    dispatch(addMessageThunk(newDM.id, true, firstMessage));
    try {
      await setDoc(dmRef, newDM);
    } catch (error) {
      dispatch(removeDirectMessage(newDM.id));
      dispatch(deleteMessageThunk(newDM.id, firstMessage));
      throw error;
    }
  };

export const toggleMuteChatThunk =
  (dm: IDirectMessage): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const user = AUTH.currentUser;
    if (!user) {
      throw new Error("You must be logged in to mute a chat.");
    }
    const dmRef = doc(FIRESTORE, dm.refPath);
    const serverUpdate: PartialWithFieldValue<IDirectMessage> = {};
    const localUpdate = dm;

    const isMuted = checkDmMuted(dm, user.uid);
    if (isMuted) {
      // If the chat is muted, we want to unmute it.
      serverUpdate.muted = arrayRemove(user.uid);
      const newMuted = localUpdate.muted
        ? localUpdate.muted.filter((id) => id !== user.uid)
        : [];
      set(localUpdate, "muted", newMuted);
    } else {
      // If the chat is not muted, we want to mute it.
      serverUpdate.muted = arrayUnion(user.uid);
      const newMuted = localUpdate.muted
        ? [...localUpdate.muted, user.uid]
        : [user.uid];
      set(localUpdate, "muted", newMuted);
    }
    dispatch(upsertDirectMessage(localUpdate));
    try {
      await updateDoc(dmRef, serverUpdate);
      await DatabaseSet(
        ref(DATABASE, `dmInfo/${dm.id}/muted/${user.uid}`),
        !isMuted
      );
    } catch (error) {
      dispatch(upsertDirectMessage(dm));
      throw error;
    }
  };

const directMessagesSlice = createSlice({
  name: "directMessages",
  initialState: directMessagesAdapter.getInitialState<DirectMessagesState>({
    loading: "idle",
  }),
  reducers: {
    setDms(state, action: PayloadAction<IDirectMessage[]>) {
      if (state.loading === "failed") {
        state.error = undefined;
      }
      state.loading = "succeeded";
      directMessagesAdapter.setAll(state, action.payload);
    },
    setSelectedDirectMessage(state, action: PayloadAction<string>) {
      state.selectedDirectMessageId = action.payload;
    },
    addDirectMessage: directMessagesAdapter.addOne,
    removeDirectMessage: directMessagesAdapter.removeOne,
    upsertDirectMessage: directMessagesAdapter.upsertOne,
    setDMsError(state, action: PayloadAction<string>) {
      state.loading = "failed";
      state.error = action.payload;
    },
    setDMsLoading(state, action: PayloadAction<LoadingStatus["loading"]>) {
      state.loading = action.payload;
    },
  },
});

export const {
  setDms,
  setSelectedDirectMessage,
  addDirectMessage,
  removeDirectMessage,
  upsertDirectMessage,
  setDMsError,
  setDMsLoading,
} = directMessagesSlice.actions;

type DirectMessagesActions =
  | ReturnType<typeof setDms>
  | ReturnType<typeof setSelectedDirectMessage>
  | ReturnType<typeof addDirectMessage>
  | ReturnType<typeof removeDirectMessage>
  | ReturnType<typeof upsertDirectMessage>
  | ReturnType<typeof setDMsError>
  | ReturnType<typeof setDMsLoading>;

export const directMessagesReducer: Reducer<
  EntityState<IDirectMessage> & DirectMessagesState,
  DirectMessagesActions
> = directMessagesSlice.reducer;

export const useDirectMessagesDispatch = () =>
  useDispatch<Dispatch<DirectMessagesActions>>();

export const useDirectMessagesThunkDispatch = () =>
  useDispatch<
    ThunkDispatch<
      EntityState<IDirectMessage> & DirectMessagesState,
      void,
      AnyAction
    >
  >();

export const directMessagesSelector =
  directMessagesAdapter.getSelectors<RootState>(
    (state) => state.directMessages
  );

export const directMessagesSingleSelector =
  directMessagesAdapter.getSelectors();

export const selectSelectedDirectMessagesAdapterId = (state: RootState) =>
  state.directMessages.selectedDirectMessageId;

export const selectSelectedDirectMessage = createSelector(
  (state: RootState) => state.directMessages,
  (directMessages) => {
    const selectedDirectMessageId = directMessages.selectedDirectMessageId;
    if (!selectedDirectMessageId) {
      return null;
    }
    return directMessagesSingleSelector.selectById(
      directMessages,
      selectedDirectMessageId
    );
  }
);

export const selectDirectMessagesLoading = (state: RootState) =>
  state.directMessages.loading === "pending" ||
  state.directMessages.loading === "idle";

export const selectDirectMessagesLoadingStatus = (state: RootState) =>
  state.directMessages.loading;

export const selectDirectMessagesError = (state: RootState) =>
  state.directMessages.error;
