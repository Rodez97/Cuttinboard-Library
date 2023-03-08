import {
  IRecurringTask,
  IRecurringTaskDoc,
} from "@cuttinboard-solutions/types-helpers";
import { createSlice, PayloadAction, Reducer } from "@reduxjs/toolkit";
import { doc, setDoc } from "firebase/firestore";
import { LoadingStatus } from "../models";
import { AppThunk, RootState } from "../reduxStore/utils";
import { FIRESTORE } from "../utils";
import {
  addPeriodicTask,
  recurringTaskDocConverter,
  removePeriodicTask,
  toggleCompleted,
  updatePeriodicTask,
} from "./RecurringTask";

export interface RecurringTasksState extends LoadingStatus {
  RecurringTasksDocument?: IRecurringTaskDoc;
}

const initialState: RecurringTasksState = {
  RecurringTasksDocument: undefined,
  loading: "idle",
};

export const addPeriodicTaskThunk =
  (
    recurringTaskDoc: IRecurringTaskDoc,
    task: IRecurringTask,
    id: string
  ): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const docRef = doc(FIRESTORE, recurringTaskDoc.refPath).withConverter(
      recurringTaskDocConverter
    );
    const { serverUpdates, updatedState } = addPeriodicTask(
      recurringTaskDoc,
      task,
      id
    );
    dispatch(upsertRecurringTasks(updatedState));
    try {
      await setDoc(docRef, serverUpdates, {
        merge: true,
      });
    } catch (error) {
      dispatch(upsertRecurringTasks(recurringTaskDoc));
      throw error;
    }
  };

export const removePeriodicTaskThunk =
  (recurringTaskDoc: IRecurringTaskDoc, id: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const docRef = doc(FIRESTORE, recurringTaskDoc.refPath).withConverter(
      recurringTaskDocConverter
    );
    const { serverUpdates, updatedState } = removePeriodicTask(
      recurringTaskDoc,
      id
    );
    dispatch(upsertRecurringTasks(updatedState));
    try {
      await setDoc(docRef, serverUpdates, {
        merge: true,
      });
    } catch (error) {
      dispatch(upsertRecurringTasks(recurringTaskDoc));
      throw error;
    }
  };

export const updatePeriodicTaskThunk =
  (
    recurringTaskDoc: IRecurringTaskDoc,
    task: IRecurringTask,
    id: string
  ): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const docRef = doc(FIRESTORE, recurringTaskDoc.refPath).withConverter(
      recurringTaskDocConverter
    );
    const { serverUpdates, updatedState } = updatePeriodicTask(
      recurringTaskDoc,
      task,
      id
    );
    dispatch(upsertRecurringTasks(updatedState));
    try {
      await setDoc(docRef, serverUpdates, {
        merge: true,
      });
    } catch (error) {
      dispatch(upsertRecurringTasks(recurringTaskDoc));
      throw error;
    }
  };

export const toggleCompletedThunk =
  (recurringTaskDoc: IRecurringTaskDoc, id: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const docRef = doc(FIRESTORE, recurringTaskDoc.refPath).withConverter(
      recurringTaskDocConverter
    );
    const { serverUpdates, updatedState } = toggleCompleted(
      recurringTaskDoc,
      id
    );
    dispatch(upsertRecurringTasks(updatedState));
    try {
      await setDoc(docRef, serverUpdates, {
        merge: true,
      });
    } catch (error) {
      dispatch(upsertRecurringTasks(recurringTaskDoc));
      throw error;
    }
  };

const recurringTasksSlice = createSlice({
  name: "recurringTasks",
  initialState,
  reducers: {
    upsertRecurringTasks(
      state,
      action: PayloadAction<IRecurringTaskDoc | undefined>
    ) {
      if (state.loading === "failed" || state.error) {
        state.error = undefined;
      }
      state.loading = "succeeded";
      state.RecurringTasksDocument = action.payload;
    },
    setRecurringTasksLoading(
      state,
      action: PayloadAction<LoadingStatus["loading"]>
    ) {
      state.loading = action.payload;
    },
    setRecurringTasksError(state, action: PayloadAction<string>) {
      state.loading = "failed";
      state.error = action.payload;
    },
  },
});

export const {
  upsertRecurringTasks,
  setRecurringTasksLoading,
  setRecurringTasksError,
} = recurringTasksSlice.actions;

type RecurringTasksActions =
  | ReturnType<typeof upsertRecurringTasks>
  | ReturnType<typeof setRecurringTasksLoading>
  | ReturnType<typeof setRecurringTasksError>;

export const recurringTasksReducer: Reducer<
  RecurringTasksState,
  RecurringTasksActions
> = recurringTasksSlice.reducer;

export const selectRecurringTasksDocument = (state: RootState) =>
  state.recurringTasks.RecurringTasksDocument;

export const selectRecurringTasksLoading = (state: RootState) =>
  state.recurringTasks.loading === "idle" ||
  state.recurringTasks.loading === "pending";

export const selectRecurringTasksLoadingStatus = (state: RootState) =>
  state.recurringTasks.loading;

export const selectRecurringTasksError = (state: RootState) =>
  state.recurringTasks.error;
