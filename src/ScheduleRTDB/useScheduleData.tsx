import { useEffect, useReducer, useState } from "react";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { useCuttinboardLocation } from "../cuttinboardLocation/useCuttinboardLocation";
import { FIRESTORE } from "../utils/firebase";
import { listReducer } from "../utils";
import { defaultIfEmpty, map, merge } from "rxjs";
import { collection, limit, query, where } from "firebase/firestore";
import { shiftConverter } from "./Shift";
import { createDefaultScheduleDoc, scheduleConverter } from "./ScheduleHelpers";
import { collectionData } from "rxfire/firestore";
import { IScheduleDoc, IShift } from "@cuttinboard-solutions/types-helpers";

type BaseEvent =
  | { type: "shifts"; event: IShift[] }
  | { type: "schedule"; event: IScheduleDoc };

export function useScheduleData(weekId: string) {
  const { onError } = useCuttinboard();
  const { location } = useCuttinboardLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [shifts, dispatch] = useReducer(listReducer<IShift>("id"), []);
  const [summaryDoc, setSummary] = useState<IScheduleDoc>(
    createDefaultScheduleDoc(weekId, location.id)
  );

  useEffect(() => {
    setLoading(true);

    const shiftsRef = query(
      collection(FIRESTORE, "shifts"),
      where("weekId", "==", weekId),
      where("locationId", "==", location.id)
    ).withConverter(shiftConverter);

    const scheduleRef = query(
      collection(FIRESTORE, "schedule"),
      where("weekId", "==", weekId),
      where("locationId", "==", location.id),
      limit(1)
    ).withConverter(scheduleConverter);

    const shifts$ = collectionData(shiftsRef).pipe(
      defaultIfEmpty(new Array<IShift>()),
      map<IShift[], BaseEvent>((change) => {
        if (!change || change.length === 0) {
          return {
            type: "shifts",
            event: [],
          };
        }
        return {
          type: "shifts",
          event: change,
        };
      })
    );

    const processShifts = (shifts: IShift[]) => {
      dispatch({ type: "SET_ELEMENTS", payload: shifts });
    };

    const schedule$ = collectionData(scheduleRef).pipe(
      defaultIfEmpty(new Array<IScheduleDoc>()),
      map<IScheduleDoc[], BaseEvent>((schedule) => {
        if (schedule.length === 0) {
          return {
            type: "schedule",
            event: createDefaultScheduleDoc(weekId, location.id),
          };
        }

        return {
          type: "schedule",
          event: schedule[0],
        };
      })
    );

    const processSchedule = (schedule: IScheduleDoc) => {
      setSummary(schedule);
    };

    const scheduleSubscription = merge(schedule$, shifts$).subscribe({
      next: (data) => {
        const { type, event } = data;

        if (type === "shifts") {
          processShifts(event);
        }

        if (type === "schedule") {
          processSchedule(event);
        }

        setLoading(false);
      },
      error: (error: Error) => {
        setLoading(false);
        setError(error);
        onError(error);
      },
    });

    return () => {
      scheduleSubscription.unsubscribe();
      dispatch({ type: "CLEAR" });
    };
  }, [location.id, onError, weekId]);

  return { shifts, summaryDoc, loading, error };
}
