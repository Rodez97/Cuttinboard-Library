import {
  createSlice,
  PayloadAction,
  Reducer,
  ThunkAction,
  AnyAction,
  ThunkDispatch,
  createSelector,
} from "@reduxjs/toolkit";
import {
  addChecklist,
  checklistGroupConverter,
  removeChecklist,
  reorderChecklists,
  resetAllTasks,
  updateChecklist,
} from ".";
import { doc, setDoc } from "firebase/firestore";
import { FIRESTORE } from "../utils";
import { RootState } from "../reduxStore/utils";
import {
  addChecklistTask,
  changeTaskStatus,
  removeChecklistTask,
  reorderChecklistTask,
  updateTask,
} from "../tasks";
import { useDispatch } from "react-redux";
import { LoadingStatus } from "../models";
import { IChecklistGroup } from "@cuttinboard-solutions/types-helpers";

export interface ChecklistsState extends LoadingStatus {
  checklist: IChecklistGroup | undefined;
}

type ChecklistThunk = ThunkAction<
  Promise<void>,
  ChecklistsState,
  unknown,
  AnyAction
>;

export const useChecklistsThunkDispatch = () =>
  useDispatch<ThunkDispatch<ChecklistsState, void, AnyAction>>();

export type ChecklistDocument = "locationChecklists" | "dailyChecklists";

export function createChecklistsSlice(name: ChecklistDocument) {
  const initialState: ChecklistsState = {
    checklist: undefined,
    loading: "idle",
  };

  const checklistsSlice = createSlice({
    name: name,
    initialState,
    reducers: {
      setChecklistGroup(
        state,
        action: PayloadAction<IChecklistGroup | undefined>
      ) {
        if (state.loading === "failed" || state.error) {
          state.error = undefined;
        }
        state.loading = "succeeded";
        state.checklist = action.payload;
      },
      setChecklistLoading(
        state,
        action: PayloadAction<LoadingStatus["loading"]>
      ) {
        state.loading = action.payload;
      },
      setChecklistError(state, action: PayloadAction<string>) {
        state.error = action.payload;
        state.loading = "failed";
      },
    },
  });

  const { setChecklistGroup, setChecklistError, setChecklistLoading } =
    checklistsSlice.actions;

  type ChecklistsActions =
    | ReturnType<typeof setChecklistGroup>
    | ReturnType<typeof setChecklistError>
    | ReturnType<typeof setChecklistLoading>;

  const checklistsReducer: Reducer<ChecklistsState, ChecklistsActions> =
    checklistsSlice.reducer;

  const resetAllTasksThunk =
    (checklistGroup: IChecklistGroup): ChecklistThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const updates = resetAllTasks(checklistGroup);
      if (!updates) {
        return;
      }
      const { serverUpdates, localUpdates } = updates;
      dispatch(setChecklistGroup(localUpdates));
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        dispatch(setChecklistGroup(checklistGroup));
        throw error;
      }
    };

  const removeChecklistThunk =
    (checklistGroup: IChecklistGroup, checklistKey: string): ChecklistThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const { serverUpdates, localUpdates } = removeChecklist(
        checklistGroup,
        checklistKey
      );
      dispatch(setChecklistGroup(localUpdates));
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        dispatch(setChecklistGroup(checklistGroup));
        throw error;
      }
    };

  const addChecklistThunk =
    (
      checklistGroup: IChecklistGroup,
      checklistKey: string,
      newTask?: { id: string; name: string }
    ): ChecklistThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const { serverUpdates, localUpdates } = addChecklist(
        checklistGroup,
        checklistKey,
        newTask
      );
      dispatch(setChecklistGroup(localUpdates));
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        dispatch(setChecklistGroup(checklistGroup));
        throw error;
      }
    };

  const reorderChecklistsThunk =
    (
      checklistGroup: IChecklistGroup,
      checklistKey: string,
      toIndex: number
    ): ChecklistThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const { serverUpdates, localUpdates } = reorderChecklists(
        checklistGroup,
        checklistKey,
        toIndex
      );
      dispatch(setChecklistGroup(localUpdates));
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        dispatch(setChecklistGroup(checklistGroup));
        throw error;
      }
    };

  const updateChecklistThunk =
    (
      checklistGroup: IChecklistGroup,
      checklistKey: string,
      newData: Partial<{
        name: string;
        description: string;
      }>
    ): ChecklistThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const { serverUpdate, localUpdate } = updateChecklist(
        checklistGroup,
        checklistKey,
        newData
      );
      dispatch(setChecklistGroup(localUpdate));
      try {
        await setDoc(docRef, serverUpdate, {
          merge: true,
        });
      } catch (error) {
        dispatch(setChecklistGroup(checklistGroup));
        throw error;
      }
    };

  const deleteAllChecklistTasksThunk =
    (checklistGroup: IChecklistGroup): ChecklistThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      dispatch(
        setChecklistGroup({
          ...checklistGroup,
          checklists: {},
        })
      );
      try {
        await setDoc(
          docRef,
          {
            checklists: {},
          },
          {
            merge: true,
          }
        );
      } catch (error) {
        dispatch(setChecklistGroup(checklistGroup));
        throw error;
      }
    };

  // ! -------- TASKS --------
  const updateTaskThunk =
    (
      checklistGroup: IChecklistGroup,
      checklistKey: string,
      taskKey: string,
      name: string
    ): ChecklistThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const { serverUpdates, localUpdates } = updateTask(
        checklistGroup,
        checklistKey,
        taskKey,
        name
      );
      dispatch(setChecklistGroup(localUpdates));
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        dispatch(setChecklistGroup(checklistGroup));
        throw error;
      }
    };

  const changeTaskStatusThunk =
    (
      checklistGroup: IChecklistGroup,
      checklistKey: string,
      taskKey: string,
      newStatus: boolean
    ): ChecklistThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const { serverUpdates, localUpdates } = changeTaskStatus(
        checklistGroup,
        checklistKey,
        taskKey,
        newStatus
      );
      dispatch(setChecklistGroup(localUpdates));
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        dispatch(setChecklistGroup(checklistGroup));
        throw error;
      }
    };

  const addTaskThunk =
    (
      checklistGroup: IChecklistGroup,
      checklistKey: string,
      taskKey: string,
      name: string
    ): ChecklistThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const { serverUpdate, localUpdate } = addChecklistTask(
        checklistGroup,
        checklistKey,
        taskKey,
        name
      );
      dispatch(setChecklistGroup(localUpdate));
      try {
        await setDoc(docRef, serverUpdate, {
          merge: true,
        });
      } catch (error) {
        dispatch(setChecklistGroup(checklistGroup));
        throw error;
      }
    };

  const removeTaskThunk =
    (
      checklistGroup: IChecklistGroup,
      checklistKey: string,
      taskKey: string
    ): ChecklistThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const { serverUpdates, localUpdates } = removeChecklistTask(
        checklistGroup,
        checklistKey,
        taskKey
      );
      dispatch(setChecklistGroup(localUpdates));
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        dispatch(setChecklistGroup(checklistGroup));
        throw error;
      }
    };

  const reorderTaskThunk =
    (
      checklistGroup: IChecklistGroup,
      checklistKey: string,
      taskKey: string,
      toIndex: number
    ): ChecklistThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const { serverUpdates, localUpdates } = reorderChecklistTask(
        checklistGroup,
        checklistKey,
        taskKey,
        toIndex
      );
      dispatch(setChecklistGroup(localUpdates));
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        dispatch(setChecklistGroup(checklistGroup));
        throw error;
      }
    };

  return {
    thunks: {
      addChecklistThunk,
      deleteAllChecklistTasksThunk,
      reorderChecklistsThunk,
      removeChecklistThunk,
      updateChecklistThunk,
      resetAllTasksThunk,
      changeTaskStatusThunk,
      addTaskThunk,
      removeTaskThunk,
      reorderTaskThunk,
      updateTaskThunk,
    },
    reducer: checklistsReducer,
    actions: checklistsSlice.actions,
  };
}

// ** locationChecklists **
export const locationChecklists = createChecklistsSlice("locationChecklists");
export const locationChecklistsSelector = (state: RootState) =>
  state.locationChecklists.checklist;
export const selectLocationChecklistsLoading = (state: RootState) =>
  state.locationChecklists.loading === "pending" ||
  state.locationChecklists.loading === "idle";
export const selectLocationChecklistsLoadingStatus = (state: RootState) =>
  state.locationChecklists.loading;
export const selectLocationChecklistsError = (state: RootState) =>
  state.locationChecklists.error;

// ** Checklists **
export const selectChecklistsLoading = (name: ChecklistDocument) =>
  createSelector(
    (state: RootState) => state[name].loading,
    (loading) => loading === "pending" || loading === "idle"
  );
export const selectChecklistsError =
  (name: ChecklistDocument) => (state: RootState) =>
    state[name].error;

// ** dailyChecklists **
export const dailyChecklists = createChecklistsSlice("dailyChecklists");
export const dailyChecklistsSelector = (state: RootState) =>
  state.dailyChecklists.checklist;
export const selectDailyChecklistsLoading = (state: RootState) =>
  state.dailyChecklists.loading === "pending" ||
  state.dailyChecklists.loading === "idle";
export const selectDailyChecklistsLoadingStatus = (state: RootState) =>
  state.dailyChecklists.loading;
export const selectDailyChecklistsError = (state: RootState) =>
  state.dailyChecklists.error;

// Actions
export const selectChecklistsThunks = (
  checklistDocument: ChecklistDocument
) => {
  switch (checklistDocument) {
    case "locationChecklists":
      return locationChecklists.thunks;
    case "dailyChecklists":
      return dailyChecklists.thunks;
  }
};

export const selectChecklistsActions = (
  checklistDocument: ChecklistDocument
) => {
  switch (checklistDocument) {
    case "locationChecklists":
      return locationChecklists.actions;
    case "dailyChecklists":
      return dailyChecklists.actions;
  }
};

export const makeChecklistsSelector = (
  checklistDocument: ChecklistDocument
) => {
  switch (checklistDocument) {
    case "locationChecklists":
      return locationChecklistsSelector;
    case "dailyChecklists":
      return dailyChecklistsSelector;
  }
};
