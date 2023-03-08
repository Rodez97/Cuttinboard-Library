import {
  getRecurringTasksArraySorted,
  IRecurringTask,
  IRecurringTaskDoc,
} from "@cuttinboard-solutions/types-helpers";
import { nanoid } from "@reduxjs/toolkit";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { useCallback, useMemo } from "react";
import { useCuttinboard } from "../cuttinboard";
import { useCuttinboardLocation } from "../cuttinboardLocation";
import {
  useAppDispatch,
  useAppSelector,
  useAppThunkDispatch,
} from "../reduxStore/utils";
import { FIRESTORE } from "../utils";
import { recurringTaskDocConverter } from "./RecurringTask";
import {
  addPeriodicTaskThunk,
  removePeriodicTaskThunk,
  selectRecurringTasksDocument,
  toggleCompletedThunk,
  updatePeriodicTaskThunk,
  upsertRecurringTasks,
} from "./recurringTasks.slice";

export function useRecurringTasks() {
  const { onError } = useCuttinboard();
  const { location } = useCuttinboardLocation();
  const recurringTaskDoc = useAppSelector(selectRecurringTasksDocument);
  const thunkDispatch = useAppThunkDispatch();
  const dispatch = useAppDispatch();

  const addPeriodicTask = useCallback(
    async (task: IRecurringTask) => {
      const id = nanoid();

      if (recurringTaskDoc) {
        thunkDispatch(addPeriodicTaskThunk(recurringTaskDoc, task, id)).catch(
          onError
        );
        return;
      }

      try {
        const docRef = doc(
          FIRESTORE,
          "Locations",
          location.id,
          "globals",
          "recurringTasks"
        ).withConverter(recurringTaskDocConverter);

        const newRecurringTasksDoc: IRecurringTaskDoc = {
          tasks: {
            [id]: task,
          },
          createdAt: Timestamp.now().toMillis(),
          locationId: location.id,
          refPath: docRef.path,
          id,
        };

        dispatch(upsertRecurringTasks(newRecurringTasksDoc));

        await setDoc(docRef, newRecurringTasksDoc, { merge: true });
      } catch (error) {
        dispatch(upsertRecurringTasks());
        onError(error);
      }
    },
    [location.id, recurringTaskDoc, thunkDispatch]
  );

  const removePeriodicTask = useCallback(
    (id: string) => {
      if (!recurringTaskDoc) {
        return;
      }
      thunkDispatch(removePeriodicTaskThunk(recurringTaskDoc, id)).catch(
        onError
      );
    },
    [recurringTaskDoc, thunkDispatch]
  );

  const updatePeriodicTask = useCallback(
    (task: IRecurringTask, id: string) => {
      if (!recurringTaskDoc) {
        return;
      }
      thunkDispatch(updatePeriodicTaskThunk(recurringTaskDoc, task, id)).catch(
        onError
      );
    },
    [recurringTaskDoc, thunkDispatch]
  );

  const completeRecurringTask = useCallback(
    (id: string) => {
      if (!recurringTaskDoc) {
        return;
      }
      thunkDispatch(toggleCompletedThunk(recurringTaskDoc, id)).catch(onError);
    },
    [recurringTaskDoc, thunkDispatch]
  );

  const recurringTasksArray = useMemo(
    () =>
      recurringTaskDoc ? getRecurringTasksArraySorted(recurringTaskDoc) : [],
    [recurringTaskDoc]
  );

  return {
    recurringTaskDoc,
    recurringTasksArray,
    addPeriodicTask,
    removePeriodicTask,
    updatePeriodicTask,
    completeRecurringTask,
  };
}
