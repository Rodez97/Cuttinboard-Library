import { useEffect, useReducer, useState } from "react";
import {
  createDefaultScheduleDoc,
  IScheduleDoc,
  IShift,
} from "@cuttinboard-solutions/types-helpers";
import { equalTo, orderByChild, query, ref } from "firebase/database";
import {
  ListenEvent,
  QueryChange,
  objectVal,
  stateChanges,
} from "rxfire/database";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { useCuttinboardLocation } from "../cuttinboardLocation/useCuttinboardLocation";
import { DATABASE } from "../utils/firebase";
import { listReducer } from "../utils";
import { defaultIfEmpty, map, merge } from "rxjs";

interface IShiftEvent {
  _key: string;
  event: ListenEvent;
  shift: IShift;
}

type BaseEvent =
  | { type: "shifts"; event: IShiftEvent | null }
  | { type: "schedule"; event: IScheduleDoc | null }
  | null;

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
      ref(DATABASE, "shifts"),
      orderByChild("locationQuery"),
      equalTo(`${weekId}-${location.id}`)
    );

    const scheduleRef = ref(DATABASE, `schedule/${location.id}/${weekId}`);

    const shifts$ = stateChanges(shiftsRef).pipe(
      map<QueryChange, BaseEvent>((change) => {
        if (!change.snapshot.exists() || !change.snapshot.key) {
          return null;
        }

        return {
          type: "shifts",
          event: {
            _key: change.snapshot.key,
            event: change.event,
            shift: change.snapshot.val(),
          },
        };
      }),
      defaultIfEmpty(null)
    );

    const processShifts = (shifts: IShiftEvent | null) => {
      if (!shifts) {
        return;
      }

      if (shifts.event === "child_added") {
        dispatch({ type: "ADD_ELEMENT", payload: shifts.shift });
      }
      if (shifts.event === "child_changed") {
        dispatch({ type: "SET_ELEMENT", payload: shifts.shift });
      }
      if (shifts.event === "child_removed") {
        dispatch({ type: "DELETE_BY_ID", payload: shifts._key });
      }
    };

    const schedule$ = objectVal<IScheduleDoc>(scheduleRef).pipe(
      map<IScheduleDoc | null, BaseEvent>((schedule) => {
        if (!schedule) {
          return null;
        }

        return {
          type: "schedule",
          event: schedule,
        };
      })
    );

    const processSchedule = (schedule: IScheduleDoc | null) => {
      if (!schedule) {
        setSummary(createDefaultScheduleDoc(weekId, location.id));
      } else {
        setSummary(schedule);
      }
    };

    const scheduleSubscription = merge(schedule$, shifts$).subscribe({
      next: (data) => {
        setLoading(false);
        if (!data) {
          return;
        }

        const { type, event } = data;

        if (type === "shifts") {
          processShifts(event);
          return;
        }

        if (type === "schedule") {
          processSchedule(event);
          return;
        }
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
