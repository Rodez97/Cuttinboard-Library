import { useEffect, useMemo, useState } from "react";
import { docData } from "rxfire/firestore";
import { combineLatest } from "rxjs";
import { doc } from "firebase/firestore";
import { ChecklistGroup, RecurringTaskDoc } from ".";
import { useCuttinboardLocation } from "../services";
import { FIRESTORE } from "../utils";

type ScheduleDataHook = [
  RecurringTaskDoc | undefined,
  ChecklistGroup | undefined,
  boolean
];

export function useTasksData(): ScheduleDataHook {
  const { location } = useCuttinboardLocation();
  const [recurringTaskDoc, setRecurringTaskDoc] = useState<RecurringTaskDoc>();
  const [tasks, setTasks] = useState<ChecklistGroup>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) setLoading(true);
    const recurringTaskDocRef = doc(
      FIRESTORE,
      "Locations",
      location.id,
      "globals",
      "recurringTasks"
    ).withConverter(RecurringTaskDoc.firestoreConverter);
    const tasksRef = doc(
      FIRESTORE,
      "Locations",
      location.id,
      "globals",
      "tasks"
    ).withConverter(ChecklistGroup.firestoreConverter);

    const recurringTaskDoc$ = docData(recurringTaskDocRef);
    const tasks$ = docData(tasksRef);

    const combined$ = combineLatest([recurringTaskDoc$, tasks$]);

    const subscription = combined$.subscribe({
      next: ([recurringTaskDoc, tasks]) => {
        loading && setLoading(false);
        setRecurringTaskDoc(recurringTaskDoc);
        setTasks(tasks);
      },
      error: (err) => {
        loading && setLoading(false);
        console.error(err);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Use the useMemo hook to memoize the array of values returned by the hook
  const resArray = useMemo<ScheduleDataHook>(
    () => [recurringTaskDoc, tasks, loading],
    [recurringTaskDoc, tasks, loading]
  );

  return resArray;
}
