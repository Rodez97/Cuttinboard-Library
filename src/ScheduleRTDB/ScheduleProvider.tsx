import React, {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek.js";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import duration from "dayjs/plugin/duration.js";
import { Dictionary, uniq } from "lodash";
import { useScheduleData } from "./useScheduleData";
import {
  getEmployeeShifts,
  getUpdatesCountArray,
  getWageData,
} from "./scheduleSelectors";
import {
  IEmployee,
  IPrimaryShiftData,
  IScheduleDoc,
  IShift,
  Shift,
  ShiftWage,
  WageDataByDay,
  WEEKFORMAT,
  WeekSchedule,
  WeekSummary,
} from "@cuttinboard-solutions/types-helpers";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { useCuttinboardLocation } from "../cuttinboardLocation";
import {
  batchPublish,
  getCancelShiftUpdateData,
  getDeleteShiftData,
  getNewShiftsDataBatch,
  getRestoreShiftData,
  getUpdateShiftData,
} from "./EmployeeShifts";
import { FIRESTORE } from "../utils";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { createShiftElement } from "./helpers";
import {
  checkIfShiftsHaveChanges,
  generateOrderFactor,
  getShiftDayjsDate,
  shiftConverter,
} from "./Shift";
import {
  getWeekDays,
  getWeekSummary,
  parseWeekId,
} from "./scheduleMathHelpers";
import { nanoid } from "nanoid";
import { scheduleConverter } from "./ScheduleHelpers";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

export interface IScheduleContext {
  weekId: string;
  setWeekId: React.Dispatch<React.SetStateAction<string>>;
  summaryDoc?: WeekSchedule["summary"];
  shifts: IShift[];
  employeeShifts: { employee: IEmployee; shifts: IShift[]; key: string }[];
  weekDays: dayjs.Dayjs[];
  weekSummary: WeekSummary;
  publish: (
    notificationRecipients: "all" | "all_scheduled" | "changed" | "none"
  ) => Promise<void>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  position: string;
  setPosition: React.Dispatch<React.SetStateAction<string>>;
  createShift: (
    shift: IShift,
    dates: dayjs.Dayjs[],
    applyToWeekDays: number[]
  ) => Promise<void>;
  cloneWeek: (targetWeekId: string, employees: string[]) => Promise<void>;
  wageData: Dictionary<{
    summary: WageDataByDay;
    shifts: Map<
      string,
      {
        wageData: ShiftWage;
        isoWeekDay: number;
      }
    >;
  }>;
  updateShift: (
    shift: IShift,
    extra: Partial<IPrimaryShiftData>
  ) => Promise<void>;
  cancelShiftUpdate: (shift: IShift) => Promise<void>;
  deleteShift: (shift: IShift) => Promise<void>;
  restoreShift: (shift: IShift) => Promise<void>;
  updateProjectedSales: (
    projectedSalesByDay: Record<number, number>
  ) => Promise<void>;
  loading: boolean;
  error?: Error | undefined;
  updatesCount: {
    newOrDraft: number;
    deleted: number;
    pendingUpdates: number;
    total: number;
  };
}

interface IScheduleProvider {
  children: ReactNode;
}

export const ShiftContext = createContext<IScheduleContext>(
  {} as IScheduleContext
);

export function ScheduleProvider({ children }: IScheduleProvider) {
  const { onError } = useCuttinboard();
  const { location, scheduleSettings, employees } = useCuttinboardLocation();
  const [weekId, setWeekId] = useState(dayjs().format(WEEKFORMAT));
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState<string>("");
  const weekDays = useMemo(() => getWeekDays(weekId), [weekId]);
  const { shifts, summaryDoc, loading, error } = useScheduleData(weekId);
  const [employeeShifts, updatesCount, wageData] = useMemo(
    () => [
      getEmployeeShifts(employees, shifts),
      getUpdatesCountArray(employees, shifts),
      getWageData(employees, shifts, scheduleSettings),
    ],
    [employees, shifts, scheduleSettings]
  );
  const weekSummary = useMemo(
    () => getWeekSummary(wageData, summaryDoc),
    [summaryDoc, wageData]
  );

  const updateShift = useCallback(
    async (shift: IShift, extra: Partial<IPrimaryShiftData>) => {
      try {
        await getUpdateShiftData(shift, extra);
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const cancelShiftUpdate = useCallback(
    async (shift: IShift) => {
      try {
        await getCancelShiftUpdateData(shift);
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const deleteShift = useCallback(
    async (shift: IShift) => {
      try {
        await getDeleteShiftData(shift);
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const restoreShift = useCallback(
    async (shift: IShift) => {
      try {
        await getRestoreShiftData(shift);
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const createShift = useCallback(
    async (shift: IShift, dates: dayjs.Dayjs[], applyToWeekDays: number[]) => {
      const newShifts: IShift[] = createShiftElement(
        shift,
        dates,
        applyToWeekDays
      );

      const updateBatch = getNewShiftsDataBatch(newShifts);

      try {
        await updateBatch.commit();
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const cloneWeek = useCallback(
    async (targetWeekId: string, employees: string[]) => {
      if (employees.length === 0) {
        console.info(
          "%c No employees selected ",
          "font-size: 1.5rem; font-weight: 600; color: purple;"
        );
        return;
      }

      const originalShifts = shifts;
      if (originalShifts.length > 0) {
        throw new Error(
          "Cannot clone shifts from a week with published shifts"
        );
      }

      const { start } = parseWeekId(targetWeekId);

      // Calculate the number of weeks difference between the first day of the target week and the first day of the current week
      const weeksDiff = Math.abs(dayjs(start).diff(weekDays[0], "weeks"));

      // Get the shifts for the target week for the given employees
      const allQueries = query(
        collection(FIRESTORE, "shifts"),
        where("weekId", "==", targetWeekId),
        where("locationId", "==", location.id)
      ).withConverter(shiftConverter);

      const exeQueries = await getDocs(allQueries);

      if (exeQueries.empty || exeQueries.size === 0) {
        console.info(
          "%c No shifts available to clone ",
          "font-size: 1.5rem; font-weight: 600; color: purple;"
        );
        return;
      }

      const shiftsArray: IShift[] = exeQueries.docs.map((doc) => doc.data());

      // Create a record of shifts to update
      const updateBatch = writeBatch(FIRESTORE);

      const updatedAt = Timestamp.now().toMillis();

      // Loop through each shift
      shiftsArray
        .filter(
          (shift) =>
            shift.status === "published" && // Only clone published shifts
            !shift.deleting && // Only clone if the shift is not being deleted
            !checkIfShiftsHaveChanges(shift) // Only clone if the shift doesn't have pending updates
        )
        .forEach((shift) => {
          const newId = nanoid();
          const shiftRef = doc(FIRESTORE, "shifts", newId).withConverter(
            shiftConverter
          );
          // Adjust the shift to the current week
          const newStart = getShiftDayjsDate(shift, "start").add(
            weeksDiff,
            "weeks"
          );
          const newEnd = getShiftDayjsDate(shift, "end").add(
            weeksDiff,
            "weeks"
          );
          const newShift: IShift = {
            ...shift,
            id: newId,
            start: Shift.toString(newStart.toDate()),
            end: Shift.toString(newEnd.toDate()),
            updatedAt,
            status: "draft",
            weekId,
            weekOrderFactor: generateOrderFactor(weekId),
          };
          updateBatch.set(shiftRef, newShift);
        });

      try {
        await updateBatch.commit();
      } catch (error) {
        onError(error);
      }
    },
    [location.id, onError, shifts, weekDays, weekId]
  );

  const updateProjectedSales = useCallback(
    async (projectedSalesByDay: Record<number, number>) => {
      const { week, year } = parseWeekId(weekId);
      let updates: Partial<IScheduleDoc> & {
        id: string;
      };
      try {
        if (summaryDoc.id) {
          updates = {
            projectedSalesByDay,
            updatedAt: Timestamp.now().toMillis(),
            id: summaryDoc.id,
          };
        } else {
          updates = {
            projectedSalesByDay,
            updatedAt: Timestamp.now().toMillis(),
            createdAt: Timestamp.now().toMillis(),
            id: nanoid(),
            weekId,
            locationId: location.id,
            year,
            weekNumber: week,
            weekOrderFactor: generateOrderFactor(weekId),
          };
        }

        await setDoc(
          doc(FIRESTORE, "schedule", updates.id).withConverter(
            scheduleConverter
          ),
          updates,
          {
            merge: true,
          }
        );
      } catch (error) {
        onError(error);
      }
    },
    [location.id, onError, summaryDoc.id, weekId]
  );

  const publish = useCallback(
    async (
      notificationRecipients: "all" | "all_scheduled" | "changed" | "none"
    ) => {
      const originalShifts = shifts;
      if (!originalShifts || !originalShifts.length) {
        console.info(
          "%c No new shifts available to publish ",
          "font-size: 1.5rem; font-weight: 600; color: purple;"
        );
        return;
      }

      let notiRecipients: string[] = [];
      switch (notificationRecipients) {
        case "all":
          // Get all employees
          notiRecipients = employees.map((e) => e.id);
          break;
        case "all_scheduled":
          // Get all employees that have shifts
          notiRecipients = originalShifts.map(({ employeeId }) => employeeId);
          break;
        case "changed":
          // Get all employees that have shifts and have changed shifts from the last published schedule
          notiRecipients = originalShifts
            .filter(checkIfShiftsHaveChanges)
            .map(({ employeeId }) => employeeId);
          break;
        default:
          break;
      }

      const updates = batchPublish(originalShifts);

      if (!updates) {
        console.info(
          "%c No new shifts available to publish ",
          "font-size: 1.5rem; font-weight: 600; color: purple;"
        );
        return;
      }

      let summaryObjectUpdates: Partial<IScheduleDoc> & {
        id: string;
      };

      try {
        if (summaryDoc.id) {
          summaryObjectUpdates = {
            id: summaryDoc.id,
            updatedAt: Timestamp.now().toMillis(),
            scheduleSummary: weekSummary,
            publishData: {
              publishedAt: Timestamp.now().toMillis(),
              notificationRecipients: uniq(notiRecipients),
            },
          };
        } else {
          summaryObjectUpdates = {
            id: nanoid(),
            createdAt: Timestamp.now().toMillis(),
            updatedAt: Timestamp.now().toMillis(),
            scheduleSummary: weekSummary,
            publishData: {
              publishedAt: Timestamp.now().toMillis(),
              notificationRecipients: uniq(notiRecipients),
            },
            weekId,
            locationId: location.id,
            year: weekDays[0].year(),
            weekNumber: weekDays[0].isoWeek(),
            weekOrderFactor: generateOrderFactor(weekId),
          };
        }

        updates.set(
          doc(FIRESTORE, "schedule", summaryObjectUpdates.id).withConverter(
            scheduleConverter
          ),
          summaryObjectUpdates,
          {
            merge: true,
          }
        );

        await updates.commit();
      } catch (error) {
        onError(error);
      }
    },
    [
      employees,
      location.id,
      onError,
      shifts,
      summaryDoc.id,
      weekDays,
      weekId,
      weekSummary,
    ]
  );

  return (
    <ShiftContext.Provider
      value={{
        weekId,
        setWeekId,
        weekDays,
        weekSummary,
        publish,
        searchQuery,
        setSearchQuery,
        position,
        setPosition,
        createShift,
        updatesCount,
        cloneWeek,
        employeeShifts,
        summaryDoc,
        wageData,
        deleteShift,
        updateShift,
        restoreShift,
        cancelShiftUpdate,
        updateProjectedSales,
        loading,
        error,
        shifts,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
}
