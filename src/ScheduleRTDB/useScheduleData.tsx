import { useCallback, useEffect, useMemo, useState } from "react";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { useCuttinboardLocation } from "../cuttinboardLocation/useCuttinboardLocation";
import { FIRESTORE } from "../utils/firebase";
import { map, merge } from "rxjs";
import { collection, limit, query, where } from "firebase/firestore";
import { shiftConverter } from "./Shift";
import { createDefaultScheduleDoc, scheduleConverter } from "./ScheduleHelpers";
import { collectionData } from "rxfire/firestore";
import type {
  IEmployee,
  IScheduleDoc,
  IShift,
} from "@cuttinboard-solutions/types-helpers";

export type EmployeeShifts = {
  employee: IEmployee;
  shifts: IShift[];
};

const getEmployeeShifts = (
  employees: IEmployee[],
  shifts: IShift[]
): EmployeeShifts[] =>
  employees.map((emp) => ({
    employee: emp,
    shifts: shifts.filter((s) => s.employeeId === emp.id),
  }));

type BaseEvent =
  | { type: "shifts"; event: IShift[] }
  | { type: "schedule"; event: IScheduleDoc };

export function useScheduleData(weekId: string) {
  const { onError } = useCuttinboard();
  const { location, employees } = useCuttinboardLocation();
  const [loading, setLoading] = useState(true);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [error, setError] = useState<Error>();
  const [shifts, setShifts] = useState<IShift[] | null>(null);
  const [employeeShifts, setEmployeeShifts] = useState<EmployeeShifts[] | null>(
    null
  );
  const [summaryDoc, setSummary] = useState<IScheduleDoc>(
    createDefaultScheduleDoc(weekId, location.id)
  );

  const processShifts = useCallback(
    (shifts: IShift[]) => {
      setShifts(shifts);
      setEmployeeShifts(getEmployeeShifts(employees, shifts));
      setLoading(false);
    },
    [employees]
  );

  const processSchedule = useCallback((schedule: IScheduleDoc) => {
    setSummary(schedule);
    setLoadingDoc(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    setLoadingDoc(true);

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

    const schedule$ = collectionData(scheduleRef).pipe(
      map<IScheduleDoc[], BaseEvent>((schedule) => {
        if (schedule?.length === 0) {
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

    const scheduleSubscription = merge(schedule$, shifts$).subscribe({
      next: (data) => {
        const { type, event } = data;

        if (type === "shifts") {
          processShifts(event);
        }

        if (type === "schedule") {
          processSchedule(event);
        }
      },
      error: (error: Error) => {
        setLoading(false);
        setLoadingDoc(false);
        setError(error);
        onError(error);
      },
    });

    return () => {
      scheduleSubscription.unsubscribe();
      setShifts(null);
    };
  }, [location.id, onError, processSchedule, processShifts, weekId]);

  return useMemo(
    () => ({
      loading: Boolean(loading || loadingDoc || !shifts || !employeeShifts),
      error,
      shifts: shifts ?? [],
      employeeShifts: employeeShifts ?? [],
      summaryDoc,
    }),
    [employeeShifts, error, loading, loadingDoc, shifts, summaryDoc]
  );
}
