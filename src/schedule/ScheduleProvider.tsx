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
  getUpdatesCount,
  getWageData,
} from "./scheduleSelectors";
import {
  getWeekDays,
  IEmployee,
  IPrimaryShiftData,
  IShift,
  ShiftWage,
  WageDataByDay,
  WEEKFORMAT,
  WeekSummary,
  WeekSchedule,
  getWeekSummary,
  parseWeekId,
  checkIfShiftsHaveChanges,
  getShiftDayjsDate,
  Shift,
  IScheduleDoc,
} from "@cuttinboard-solutions/types-helpers";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { useCuttinboardLocation } from "../cuttinboardLocation";
import {
  batchPublish,
  EmployeeShiftsDocumentUpdates,
  getCancelShiftUpdateData,
  getDeleteShiftData,
  getEmployeeShiftsRefPath,
  getNewShiftsData,
  getRestoreShiftData,
  getUpdateShiftData,
} from "./EmployeeShifts";
import {
  equalTo,
  get,
  orderByChild,
  query,
  ref,
  update,
} from "firebase/database";
import { DATABASE } from "../utils";
import { Timestamp } from "firebase/firestore";
import { copyPropertiesWithPrefix, createShiftElement } from "./helpers";
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
  const { shifts, employeeShifts, summaryDoc, loading, error } =
    useScheduleData(weekId);
  const [updatesCount, wageData] = useMemo(
    () => [
      getUpdatesCount(employees, shifts),
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
      const updates = getUpdateShiftData(shift, extra);

      if (!updates) {
        console.log("No updates to make");
        return;
      }

      try {
        await update(ref(DATABASE), updates);
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const cancelShiftUpdate = useCallback(
    async (shift: IShift) => {
      const updates = getCancelShiftUpdateData(shift);

      if (!updates) {
        console.log("No updates to make");
        return;
      }

      try {
        await update(ref(DATABASE), updates);
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const deleteShift = useCallback(
    async (shift: IShift) => {
      const updates = getDeleteShiftData(shift);

      if (!updates) {
        console.log("No updates to make");
        return;
      }

      try {
        await update(ref(DATABASE), updates);
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const restoreShift = useCallback(
    async (shift: IShift) => {
      const updates = getRestoreShiftData(shift);

      if (!updates) {
        console.log("No updates to make");
        return;
      }

      try {
        await update(ref(DATABASE), updates);
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

      const serverUpdates = getNewShiftsData(newShifts);

      try {
        await update(ref(DATABASE), serverUpdates);
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
        ref(DATABASE, `shifts/${targetWeekId}`),
        orderByChild("locationId"),
        equalTo(location.id)
      );

      const exeQueries = await get(allQueries);

      if (!exeQueries.exists() || !exeQueries.size) {
        console.info(
          "%c No shifts available to clone ",
          "font-size: 1.5rem; font-weight: 600; color: purple;"
        );
        return;
      }

      const shiftsArray: IShift[] = Object.values(exeQueries.val());

      // Create a record of shifts to update
      const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] = {};

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
          const employeeShiftsRefPath = getEmployeeShiftsRefPath(shift.id);

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
            start: Shift.toString(newStart.toDate()),
            end: Shift.toString(newEnd.toDate()),
            updatedAt,
            status: "draft",
            weekId,
            locationQuery: `${weekId}_${location.id}`,
            employeeQuery: `${weekId}_${shift.employeeId}`,
          };
          serverUpdates[`${employeeShiftsRefPath}`] = newShift;
        });

      try {
        await update(ref(DATABASE), serverUpdates);
      } catch (error) {
        onError(error);
      }
    },
    [location.id, onError, shifts, weekDays, weekId]
  );

  const updateProjectedSales = useCallback(
    async (projectedSalesByDay: Record<number, number>) => {
      try {
        const serverUpdates: EmployeeShiftsDocumentUpdates["serverUpdates"] =
          {};

        for (const key in projectedSalesByDay) {
          const projectedSales = projectedSalesByDay[key];
          serverUpdates[
            `schedule/${location.id}/${weekId}/projectedSalesByDay/${key}`
          ] = projectedSales;
        }

        await update(ref(DATABASE), serverUpdates);
      } catch (error) {
        onError(error);
      }
    },
    [location.id, onError, weekId]
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

      try {
        const summaryObjectUpdate: Omit<IScheduleDoc, "createdAt"> = {
          updatedAt: Timestamp.now().toMillis(),
          year: weekDays[0].year(),
          weekNumber: weekDays[0].isoWeek(),
          scheduleSummary: weekSummary,
          publishData: {
            publishedAt: Timestamp.now().toMillis(),
            notificationRecipients: uniq(notiRecipients),
          },
          locationId: location.id,
          weekId,
          weekStart: weekDays[0].format("YYYY-MM-DD"),
          weekEnd: weekDays[6].format("YYYY-MM-DD"),
        };

        const batchUpdateObject: EmployeeShiftsDocumentUpdates["serverUpdates"] =
          {
            ...updates,
          };

        copyPropertiesWithPrefix(
          summaryObjectUpdate,
          batchUpdateObject,
          `schedule/${location.id}/${weekId}`
        );

        await update(ref(DATABASE), batchUpdateObject);
      } catch (error) {
        onError(error);
      }
    },
    [employees, location.id, onError, shifts, weekDays, weekId, weekSummary]
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
