import { useEffect } from "react";
import { docData } from "rxfire/firestore";
import { combineLatest } from "rxjs";
import { doc } from "firebase/firestore";
import { FIRESTORE } from "../utils";
import { recurringTaskDocConverter } from "../recurringTasks/RecurringTask";
import {
  selectRecurringTasksError,
  selectRecurringTasksLoading,
  selectRecurringTasksLoadingStatus,
  setRecurringTasksError,
  setRecurringTasksLoading,
  upsertRecurringTasks,
} from "../recurringTasks";
import {
  checklistGroupConverter,
  locationChecklists,
  selectLocationChecklistsError,
  selectLocationChecklistsLoading,
  selectLocationChecklistsLoadingStatus,
} from "../checklistsGroups";
import { selectLocation } from "../cuttinboardLocation/locationSelectors";
import { useAppDispatch, useAppSelector } from "../reduxStore";
import { useCuttinboard } from "../cuttinboard";

export function useLocationChecklistsData() {
  const location = useAppSelector(selectLocation);
  if (!location) {
    throw new Error("No active location");
  }
  const tasksLoading = useAppSelector(selectLocationChecklistsLoading);
  const recurringTasksLoading = useAppSelector(selectRecurringTasksLoading);
  const tasksLoadingStatus = useAppSelector(
    selectLocationChecklistsLoadingStatus
  );
  const recurringTasksLoadingStatus = useAppSelector(
    selectRecurringTasksLoadingStatus
  );
  const error = useAppSelector(selectLocationChecklistsError);
  const recurringTasksError = useAppSelector(selectRecurringTasksError);
  const dispatch = useAppDispatch();
  const { onError } = useCuttinboard();

  useEffect(() => {
    if (
      tasksLoadingStatus !== "succeeded" ||
      recurringTasksLoadingStatus !== "succeeded"
    ) {
      // Start loading
      dispatch(locationChecklists.actions.setChecklistLoading("pending"));
      dispatch(setRecurringTasksLoading("pending"));
    }

    const recurringTaskDocRef = doc(
      FIRESTORE,
      "Locations",
      location.id,
      "globals",
      "recurringTasks"
    ).withConverter(recurringTaskDocConverter);

    const tasksRef = doc(
      FIRESTORE,
      "Locations",
      location.id,
      "globals",
      "locationChecklists"
    ).withConverter(checklistGroupConverter);

    const recurringTaskDoc$ = docData(recurringTaskDocRef);
    const tasks$ = docData(tasksRef);

    const combined$ = combineLatest([recurringTaskDoc$, tasks$]);

    const subscription = combined$.subscribe({
      next: ([recurringTaskDoc, locationChecklistDoc]) => {
        dispatch(upsertRecurringTasks(recurringTaskDoc));
        dispatch(
          locationChecklists.actions.setChecklistGroup(locationChecklistDoc)
        );
      },
      error: (err) => {
        dispatch(locationChecklists.actions.setChecklistError(err?.message));
        dispatch(setRecurringTasksError(err?.message));
        onError(err);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    loading: tasksLoading || recurringTasksLoading,
    error: error ?? recurringTasksError,
  };
}
