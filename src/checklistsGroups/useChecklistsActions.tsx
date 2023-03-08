import { doc, setDoc, Timestamp } from "firebase/firestore";
import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../reduxStore/utils";
import { useCuttinboard } from "../cuttinboard";
import { FIRESTORE } from "../utils";
import { checklistGroupConverter } from "./checklistGroupUtils";
import { useCuttinboardLocation } from "../cuttinboardLocation";
import {
  ChecklistDocument,
  makeChecklistsSelector,
  selectChecklistsActions,
  selectChecklistsError,
  selectChecklistsLoading,
  selectChecklistsThunks,
  useChecklistsThunkDispatch,
} from ".";
import {
  getChecklistsArray,
  IChecklistGroup,
} from "@cuttinboard-solutions/types-helpers";

export function useChecklistsActions(checklistDocument: ChecklistDocument) {
  const { user, onError } = useCuttinboard();
  const { location } = useCuttinboardLocation();
  const [checklistSelector, loadingSelector, errorSelector] = useMemo(
    () => [
      makeChecklistsSelector(checklistDocument),
      selectChecklistsLoading(checklistDocument),
      selectChecklistsError(checklistDocument),
    ],
    [checklistDocument]
  );
  const checklistGroup = useAppSelector(checklistSelector);
  const loading = useAppSelector(loadingSelector);
  const error = useAppSelector(errorSelector);
  const thunkDispatch = useChecklistsThunkDispatch();
  const dispatch = useAppDispatch();

  const updateChecklistTask = useCallback(
    (checklistKey: string, taskKey: string, name: string) => {
      if (!checklistGroup) {
        return;
      }
      thunkDispatch(
        selectChecklistsThunks(checklistDocument).updateTaskThunk(
          checklistGroup,
          checklistKey,
          taskKey,
          name
        )
      ).catch(onError);
    },
    [thunkDispatch, checklistGroup]
  );

  const changeChecklistTaskStatus = useCallback(
    (checklistKey: string, taskKey: string, newStatus: boolean) => {
      if (!checklistGroup) {
        return;
      }
      thunkDispatch(
        selectChecklistsThunks(checklistDocument).changeTaskStatusThunk(
          checklistGroup,
          checklistKey,
          taskKey,
          newStatus
        )
      ).catch(onError);
    },
    [thunkDispatch, checklistGroup]
  );

  const addChecklistTask = useCallback(
    (checklistKey: string, taskKey: string, name: string) => {
      if (!checklistGroup) {
        return;
      }
      thunkDispatch(
        selectChecklistsThunks(checklistDocument).addTaskThunk(
          checklistGroup,
          checklistKey,
          taskKey,
          name
        )
      ).catch(onError);
    },
    [thunkDispatch, checklistGroup]
  );

  const removeChecklistTask = useCallback(
    (checklistKey: string, taskKey: string) => {
      if (!checklistGroup) {
        return;
      }
      thunkDispatch(
        selectChecklistsThunks(checklistDocument).removeTaskThunk(
          checklistGroup,
          checklistKey,
          taskKey
        )
      ).catch(onError);
    },
    [thunkDispatch, checklistGroup]
  );

  const reorderChecklistTask = useCallback(
    (checklistKey: string, taskKey: string, toIndex: number) => {
      if (!checklistGroup) {
        return;
      }
      thunkDispatch(
        selectChecklistsThunks(checklistDocument).reorderTaskThunk(
          checklistGroup,
          checklistKey,
          taskKey,
          toIndex
        )
      ).catch(onError);
    },
    [thunkDispatch, checklistGroup]
  );

  const resetAllTasks = useCallback(() => {
    if (!checklistGroup) {
      return;
    }
    thunkDispatch(
      selectChecklistsThunks(checklistDocument).resetAllTasksThunk(
        checklistGroup
      )
    ).catch(onError);
  }, [checklistGroup, thunkDispatch]);

  const removeChecklist = useCallback(
    (checklistKey: string) => {
      if (!checklistGroup) {
        return;
      }
      thunkDispatch(
        selectChecklistsThunks(checklistDocument).removeChecklistThunk(
          checklistGroup,
          checklistKey
        )
      ).catch(onError);
    },
    [thunkDispatch, checklistGroup]
  );

  const addChecklist = useCallback(
    (id: string | number, newTask?: { id: string; name: string }) => {
      if (checklistGroup) {
        thunkDispatch(
          selectChecklistsThunks(checklistDocument).addChecklistThunk(
            checklistGroup,
            id.toString(),
            newTask
          )
        ).catch(onError);
      } else {
        const docRef = doc(
          FIRESTORE,
          "Locations",
          location.id,
          "globals",
          checklistDocument
        ).withConverter(checklistGroupConverter);
        // If we don't have a checklist, we're creating a new one
        const newChecklistGroup: IChecklistGroup = {
          locationId: location.id,
          checklists: {
            [id.toString()]: {
              name: `Task List #1`,
              createdAt: Timestamp.now().toMillis(),
              createdBy: user.uid,
              order: 1,
              id: id.toString(),
            },
          },
          createdAt: Timestamp.now().toMillis(),
          refPath: docRef.path,
          id: checklistDocument,
        };
        dispatch(
          selectChecklistsActions(checklistDocument).setChecklistGroup(
            newChecklistGroup
          )
        );
        setDoc(docRef, newChecklistGroup).catch((err) => {
          dispatch(
            selectChecklistsActions(checklistDocument).setChecklistGroup()
          );
          onError(err);
        });
      }
    },
    [checklistGroup, thunkDispatch, location.id, user.uid, dispatch]
  );

  const reorderChecklists = useCallback(
    (checklistKey: string, toIndex: number) => {
      if (!checklistGroup) {
        return;
      }
      thunkDispatch(
        selectChecklistsThunks(checklistDocument).reorderChecklistsThunk(
          checklistGroup,
          checklistKey,
          toIndex
        )
      ).catch(onError);
    },
    [thunkDispatch, checklistGroup]
  );

  const updateChecklists = useCallback(
    (
      checklistKey: string,
      newData: Partial<{
        name: string;
        description: string;
      }>
    ) => {
      if (!checklistGroup) {
        return;
      }
      thunkDispatch(
        selectChecklistsThunks(checklistDocument).updateChecklistThunk(
          checklistGroup,
          checklistKey,
          newData
        )
      ).catch(onError);
    },
    [thunkDispatch, checklistGroup]
  );

  const deleteAllChecklists = useCallback(() => {
    if (!checklistGroup) {
      return;
    }
    thunkDispatch(
      selectChecklistsThunks(checklistDocument).deleteAllChecklistTasksThunk(
        checklistGroup
      )
    ).catch(onError);
  }, [checklistGroup, thunkDispatch]);

  const checklistsArray = useMemo(() => {
    if (!checklistGroup) {
      return [];
    }
    return getChecklistsArray(checklistGroup);
  }, [checklistGroup]);

  return {
    checklistGroup,
    checklistsArray,
    resetAllTasks,
    removeChecklist,
    addChecklist,
    reorderChecklists,
    deleteAllChecklists,
    updateChecklistTask,
    changeChecklistTaskStatus,
    addChecklistTask,
    removeChecklistTask,
    reorderChecklistTask,
    updateChecklists,
    loading,
    error,
  };
}
