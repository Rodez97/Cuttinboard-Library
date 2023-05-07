import { useEffect, useMemo, useReducer, useState } from "react";
import {
  createDefaultScheduleDoc,
  IScheduleDoc,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { useCuttinboardLocation } from "../cuttinboardLocation/useCuttinboardLocation";
import { FIRESTORE } from "../utils/firebase";
import { listReducer } from "../utils";
import { defaultIfEmpty, map, merge } from "rxjs";
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  collection,
  limit,
  query,
  where,
} from "firebase/firestore";
import { collectionData } from "rxfire/firestore";
import {
  IEmployeeShiftsDocument,
  extractShifts,
  shiftConverter,
} from "./CustomTypes";

type BaseEvent =
  | { type: "shifts"; event: IEmployeeShiftsDocument[] }
  | { type: "schedule"; event: IScheduleDoc }
  | null;

export const scheduleConverter = {
  toFirestore(object: IScheduleDoc): DocumentData {
    return object;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IScheduleDoc>,
    options: SnapshotOptions
  ): IScheduleDoc {
    const rawData = value.data(options);
    return rawData;
  },
};

export function useScheduleData(weekId: string) {
  const { onError } = useCuttinboard();
  const { location, employees } = useCuttinboardLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [shiftsDocuments, dispatch] = useReducer(
    listReducer<IEmployeeShiftsDocument>("id"),
    []
  );
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
      map<IEmployeeShiftsDocument[], BaseEvent>((shiftsData) => {
        if (!shiftsData) {
          return null;
        }
        return {
          type: "shifts",
          event: shiftsData,
        };
      }),
      defaultIfEmpty(null)
    );

    const processShifts = (shifts: IEmployeeShiftsDocument[]) => {
      dispatch({ type: "SET_ELEMENTS", payload: shifts });
    };

    const schedule$ = collectionData(scheduleRef).pipe(
      map<IScheduleDoc[] | null, BaseEvent>((schedule) => {
        if (!schedule || schedule.length === 0) {
          return null;
        }

        return {
          type: "schedule",
          event: schedule[0],
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

  const employeeShifts = useMemo(() => {
    return employees
      .filter((e) => e.role !== RoleAccessLevels.ADMIN)
      .map((emp) => {
        const shiftsDoc = shiftsDocuments.find((s) => s.employeeId === emp.id);
        const shifts = shiftsDoc ? extractShifts(shiftsDoc) : null;
        return {
          employee: emp,
          shifts,
          key: emp.id,
        };
      });
  }, [employees, shiftsDocuments]);

  const shifts = useMemo(() => {
    return shiftsDocuments.flatMap((s) => extractShifts(s));
  }, [shiftsDocuments]);

  return { shifts, employeeShifts, summaryDoc, loading, error };
}
