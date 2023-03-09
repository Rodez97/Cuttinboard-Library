import {
  createSlice,
  Dispatch,
  PayloadAction,
  Reducer,
  ThunkDispatch,
  AnyAction,
} from "@reduxjs/toolkit";
import { ref, remove } from "firebase/database";
import { useDispatch } from "react-redux";
import { AUTH, DATABASE } from "../utils";
import { AppThunk, RootState } from "../reduxStore/utils";
import { INotifications } from "@cuttinboard-solutions/types-helpers";
import { clone, unset } from "lodash";

export interface NotificationsState {
  data: INotifications;
}

const initialState: NotificationsState = {
  data: {},
};

export const removeDMBadgeThunk =
  (dmId: string): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    if (!AUTH.currentUser) {
      throw new Error("User not logged in");
    }

    const state = getState();

    const notifications = state.notifications.data;

    const localUpdate: INotifications = clone(notifications);

    if (!localUpdate.dm?.[dmId]) {
      return;
    }

    unset(localUpdate, ["dm", dmId]);

    dispatch(setNotifications(localUpdate));

    try {
      const deleteRef = ref(
        DATABASE,
        `users/${AUTH.currentUser.uid}/notifications/dm/${dmId}`
      );
      await remove(deleteRef);
    } catch (error) {
      dispatch(setNotifications(notifications));
      throw error;
    }
  };

export const removeScheduleBadgesThunk =
  (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    if (!AUTH.currentUser) {
      throw new Error("User not logged in");
    }

    const state = getState();

    const notifications = state.notifications.data;

    const localUpdate: INotifications = clone(notifications);

    if (!localUpdate.sch) {
      // No badges to remove
      return;
    }

    unset(localUpdate, "sch");

    dispatch(setNotifications(localUpdate));

    try {
      await remove(
        ref(DATABASE, `users/${AUTH.currentUser.uid}/notifications/sch`)
      );
    } catch (error) {
      dispatch(setNotifications(notifications));
      throw error;
    }
  };

export const removeConversationBadgesThunk =
  (
    organizationId: string,
    locationId: string,
    conversationId: string
  ): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    if (!AUTH.currentUser) {
      throw new Error("User not logged in");
    }

    const state = getState();

    const notifications = state.notifications.data;

    const localUpdate: INotifications = clone(notifications);

    if (
      !localUpdate.organizations?.[organizationId]?.locations?.[locationId]
        ?.conv?.[conversationId]
    ) {
      // No badges to remove
      return;
    }

    unset(localUpdate, [
      "organizations",
      organizationId,
      "locations",
      locationId,
      "conv",
      conversationId,
    ]);

    dispatch(setNotifications(localUpdate));

    try {
      await remove(
        ref(
          DATABASE,
          `users/${AUTH.currentUser.uid}/notifications/organizations/${organizationId}/locations/${locationId}/conv/${conversationId}`
        )
      );
    } catch (error) {
      dispatch(setNotifications(notifications));
      throw error;
    }
  };

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<INotifications>) {
      state.data = action.payload;
    },
  },
});

export const { setNotifications } = notificationsSlice.actions;

type NotificationsActions = ReturnType<typeof setNotifications>;

export const notificationsReducer: Reducer<
  NotificationsState,
  NotificationsActions
> = notificationsSlice.reducer;

export const useNotificationsDispatch = () =>
  useDispatch<Dispatch<NotificationsActions>>();

export const useNotificationsThunkDispatch = () =>
  useDispatch<ThunkDispatch<NotificationsState, void, AnyAction>>();

export const selectNotifications = (state: RootState) =>
  state.notifications.data;
