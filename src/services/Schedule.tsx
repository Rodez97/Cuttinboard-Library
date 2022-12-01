import { collection, doc, query, where, setDoc } from "@firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";
import { Firestore } from "../firebase";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import { chunk, isEmpty, uniq } from "lodash";
import {
  getDocs,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  serverTimestamp,
  WithFieldValue,
  writeBatch,
} from "firebase/firestore";
import { useLocation } from "./Location";
import { ScheduleDoc, WeekSummary } from "../models/schedule/ScheduleDoc";
import { IShift, Shift } from "./../models/schedule/Shift";
import { useEmployeesList } from "./useEmployeesList";
import {
  EmployeeShifts,
  IEmployeeShifts,
  WageDataByDay,
} from "./../models/schedule/EmployeeShifts";
import { FirebaseSignature } from "models";
import { WEEKFORMAT } from "../utils";
import { useCuttinboard } from "./Cuttinboard";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

type ScheduleFormData = {
  ot_week: {
    enabled: boolean;
    hours: number;
    multiplier: number;
  };
  ot_day: {
    enabled: boolean;
    hours: number;
    multiplier: number;
  };
  presetTimes?: {
    start: string;
    end: string;
  }[];
};

const ScheduleFormDataConverter = {
  toFirestore: (data: ScheduleFormData) => data,
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<ScheduleFormData>
  ): ScheduleFormData => snapshot.data(),
};

/**
 * get date by week number
 * @param  {Number} year
 * @param  {Number} week
 * @param  {Number} day of week (optional; default = 1 (Monday))
 * @return {Date}
 */
export function weekToDate(year: number, week: number, weekDay = 1): Date {
  const getZeroBasedIsoWeekDay = (date: Date) => (date.getDay() + 6) % 7;
  const getIsoWeekDay = (date: Date) => getZeroBasedIsoWeekDay(date) + 1;
  const zeroBasedWeek = week - 1;
  const zeroBasedWeekDay = weekDay - 1;
  let days = zeroBasedWeek * 7 + zeroBasedWeekDay;
  // Dates start at 2017-01-01 and not 2017-01-00
  days += 1;

  const firstDayOfYear = new Date(year, 0, 1);
  const firstIsoWeekDay = getIsoWeekDay(firstDayOfYear);
  const zeroBasedFirstIsoWeekDay = getZeroBasedIsoWeekDay(firstDayOfYear);

  // If year begins with W52 or W53
  if (firstIsoWeekDay > 4) {
    days += 8 - firstIsoWeekDay;
    // Else begins with W01
  } else {
    days -= zeroBasedFirstIsoWeekDay;
  }

  return new Date(year, 0, days);
}

interface ScheduleContextProps {
  weekId: string;
  setWeekId: React.Dispatch<React.SetStateAction<string>>;
  scheduleDocument?: ScheduleDoc;
  scheduleDocumentLoading: boolean;
  employeeShiftsCollection: EmployeeShifts[];
  shiftsCollectionLoading: boolean;
  weekDays: Date[];
  scheduleSummary: {
    total: {
      normalHours: number;
      overtimeHours: number;
      totalHours: number;
      normalWage: number;
      overtimeWage: number;
      totalWage: number;
      totalPeople: number;
      totalShifts: number;
      projectedSales: number;
      laborPercentage: number;
    };
    byDay: WageDataByDay;
  };
  publish: (
    notificationRecipients: "all" | "all_scheduled" | "changed" | "none"
  ) => Promise<void>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedTag: string;
  setSelectedTag: React.Dispatch<React.SetStateAction<string>>;
  editProjectedSales: (
    projectedSalesByDay: Record<number, number>
  ) => Promise<void>;
  createShift: (
    shift: IShift,
    dates: Date[],
    applyToWeekDays: number[],
    id: string,
    employeeId: string
  ) => Promise<void>;
  updatesCount: {
    newOrDraft: number;
    deleted: number;
    pendingUpdates: number;
    total: number;
  };
  cloneWeek: (targetWeekId: string, employees: string[]) => Promise<void>;
  loading: boolean;
  error?: Error;
  scheduleSettingsData?: ScheduleFormData;
}

interface ScheduleProviderProps {
  children:
    | ReactNode
    | ((props: {
        scheduleDoc?: ScheduleDoc;
        employeeShiftsCollection: EmployeeShifts[];
        error?: Error;
        loading: boolean;
      }) => JSX.Element);
  onError: (error: Error) => void;
}

const ShiftContext = createContext<ScheduleContextProps>(
  {} as ScheduleContextProps
);

export function ScheduleProvider({ children, onError }: ScheduleProviderProps) {
  const [weekId, setWeekId] = useState(dayjs().format(WEEKFORMAT));
  const { location } = useLocation();
  const { user } = useCuttinboard();
  const { getEmployees } = useEmployeesList();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [scheduleDocument, scheduleDocumentLoading, sdError] =
    useDocumentData<ScheduleDoc>(
      doc(
        Firestore,
        "Organizations",
        location.organizationId,
        "scheduleDocs",
        `${weekId}_${location.id}`
      ).withConverter(ScheduleDoc.Converter)
    );
  const [employeeShiftsCollectionRaw, shiftsCollectionLoading, scError] =
    useCollectionData<EmployeeShifts>(
      query(
        collection(
          Firestore,
          "Organizations",
          location.organizationId,
          "shifts"
        ),
        where("weekId", "==", weekId),
        where("locationId", "==", location.id)
      ).withConverter(EmployeeShifts.Converter)
    );
  // Get Schedule Settings from Firestore
  const [scheduleSettingsData, loading, error] =
    useDocumentData<ScheduleFormData>(
      doc(
        Firestore,
        "Organizations",
        location.organizationId,
        "settings",
        `schedule_${location.id}`
      ).withConverter(ScheduleFormDataConverter)
    );

  // Initialize EmployeeShifts Collection with schedule settings
  const employeeShiftsCollection = useMemo(() => {
    let initializedCollection: EmployeeShifts[] = [];

    if (
      loading ||
      shiftsCollectionLoading ||
      scheduleDocumentLoading ||
      !employeeShiftsCollectionRaw
    ) {
      return initializedCollection;
    }

    if (scheduleSettingsData) {
      const { ot_day, ot_week } = scheduleSettingsData;
      if (ot_week.enabled) {
        const { hours, multiplier } = ot_week;
        initializedCollection = employeeShiftsCollectionRaw?.map((shift) => {
          shift.calculateWageData({
            mode: "weekly",
            hoursLimit: hours,
            multiplier,
          });
          return shift;
        });
      } else if (ot_day.enabled) {
        const { hours, multiplier } = ot_day;
        initializedCollection = employeeShiftsCollectionRaw?.map((shift) => {
          shift.calculateWageData({
            mode: "daily",
            hoursLimit: hours,
            multiplier,
          });
          return shift;
        });
      } else {
        initializedCollection = employeeShiftsCollectionRaw?.map((shift) => {
          shift.calculateWageData();
          return shift;
        });
      }
    } else {
      initializedCollection = employeeShiftsCollectionRaw?.map((shift) => {
        shift.calculateWageData();
        return shift;
      });
    }
    return initializedCollection;
  }, [scheduleSettingsData, employeeShiftsCollectionRaw]);

  const weekDays = useMemo(() => {
    const year = Number.parseInt(weekId.split("-")[2]);
    const weekNo = Number.parseInt(weekId.split("-")[1]);
    const firstDayWeek = weekToDate(year, weekNo, 1);
    const weekDays: Date[] = [];
    weekDays.push(firstDayWeek);
    for (let index = 1; index < 7; index++) {
      weekDays.push(dayjs(firstDayWeek).add(index, "days").toDate());
    }
    return weekDays;
  }, [weekId]);

  const scheduleSummary = useMemo((): WeekSummary => {
    const totalProjectedSales = scheduleDocument?.totalProjectedSales ?? 0;

    const total = {
      normalHours: 0,
      overtimeHours: 0,
      totalHours: 0,
      normalWage: 0,
      overtimeWage: 0,
      totalWage: 0,
      totalPeople: 0,
      totalShifts: 0,
      projectedSales: totalProjectedSales,
      laborPercentage: 0,
    };

    const byDay: WageDataByDay = {};

    // Filter to get the empShifts that actually have shifts
    const filteredEmpShifts = employeeShiftsCollection?.filter(
      (empShift) => empShift.shiftsArray.length > 0
    );

    if (!filteredEmpShifts || !filteredEmpShifts.length) {
      // If there are no shifts, return the default values
      return { total, byDay };
    }
    // Get the total of all summary fields
    filteredEmpShifts.forEach((shfDoc) => {
      const { summary, wageData } = shfDoc;
      total.normalHours += summary.normalHours;
      total.overtimeHours += summary.overtimeHours;
      total.totalHours += summary.totalHours;
      total.normalWage += summary.normalWage;
      total.overtimeWage += summary.overtimeWage;
      total.totalWage += summary.totalWage;
      total.totalPeople += 1;
      total.totalShifts += summary.totalShifts;

      // Get the wage data by day
      Object.keys(wageData).forEach((day) => {
        const parseDay = Number.parseInt(day);
        const dayData = wageData[parseDay];
        if (dayData) {
          if (byDay[parseDay]) {
            byDay[parseDay].normalHours += dayData.normalHours;
            byDay[parseDay].overtimeHours += dayData.overtimeHours;
            byDay[parseDay].totalHours += dayData.totalHours;
            byDay[parseDay].normalWage += dayData.normalWage;
            byDay[parseDay].overtimeWage += dayData.overtimeWage;
            byDay[parseDay].totalWage += dayData.totalWage;
            byDay[parseDay].totalShifts += dayData.totalShifts;
            byDay[parseDay].people += 1;
          } else {
            byDay[parseDay] = {
              ...dayData,
            };
          }
        }
      });
    });

    // Calculate total wage percentage of projected sales
    total.laborPercentage = totalProjectedSales
      ? (total.totalWage / totalProjectedSales) * 100
      : 0;

    return { total, byDay };
  }, [employeeShiftsCollection, scheduleDocument]);

  /**
   * Publishes the schedule to the employees
   */
  const publish = useCallback(
    async (
      notificationRecipients: "all" | "all_scheduled" | "changed" | "none"
    ) => {
      if (!employeeShiftsCollection || !employeeShiftsCollection.length) {
        return;
      }
      let notiRecipients: string[] = [];
      if (notificationRecipients === "all") {
        // Get all employees
        notiRecipients = getEmployees.map((e) => e.id);
      }
      if (notificationRecipients === "all_scheduled") {
        // Get all employees that have shifts
        notiRecipients = employeeShiftsCollection
          .filter((e) => e.shiftsArray.length > 0)
          .map((shift) => shift.employeeId);
      }
      if (notificationRecipients === "changed") {
        // Get all employees that have shifts and have changed shifts from the last published schedule
        notiRecipients = employeeShiftsCollection
          .filter((empShiftDoc) => empShiftDoc.haveChanges)
          .map((shift) => shift.employeeId);
      }
      try {
        // Publish the schedule
        const batch = writeBatch(Firestore);
        employeeShiftsCollection.forEach((shiftsDoc) =>
          // Update the shifts document
          shiftsDoc.batchPublish(batch)
        );
        const year = Number.parseInt(weekId.split("-")[2]);
        const weekNumber = Number.parseInt(weekId.split("-")[1]);
        // Update the schedule document
        batch.set(
          doc(
            Firestore,
            "Organizations",
            location.organizationId,
            "scheduleDocs",
            `${weekId}_${location.id}`
          ),
          {
            weekId,
            locationId: location.id,
            year,
            weekNumber,
            notificationRecipients: uniq(notiRecipients),
            updatedAt: serverTimestamp(),
            scheduleSummary,
          },
          {
            merge: true,
          }
        );
        // Commit the batch
        await batch.commit();
      } catch (error) {
        onError(error);
        throw error;
      }
    },
    [weekId, location, employeeShiftsCollection, scheduleSummary]
  );

  const editProjectedSales = useCallback(
    async (projectedSalesByDay: Record<number, number>) => {
      try {
        await setDoc(
          doc(
            Firestore,
            "Organizations",
            location.organizationId,
            "scheduleDocs",
            `${weekId}_${location.id}`
          ),
          {
            projectedSalesByDay,
          },
          {
            merge: true,
          }
        );
      } catch (error) {
        onError(error);
        throw error;
      }
    },
    [weekId]
  );

  const createShift = useCallback(
    async (
      shift: IShift,
      dates: Date[],
      applyToWeekDays: number[],
      id: string,
      employeeId: string
    ) => {
      // Get the EmployeeShiftsDoc by id
      const employeeShiftDoc = employeeShiftsCollection?.find(
        (empShiftDoc) =>
          empShiftDoc.id === `${weekId}_${employeeId}_${location.id}`
      );
      if (employeeShiftDoc && !isEmpty(employeeShiftDoc)) {
        await employeeShiftDoc.createShift(shift, dates, applyToWeekDays, id);
        return;
      }

      try {
        const initializeEmpShiftDoc: PartialWithFieldValue<
          IEmployeeShifts & FirebaseSignature
        > = {
          shifts: {},
          employeeId,
          weekId,
          updatedAt: serverTimestamp(),
          locationId: location.id,
        };
        const { start, end, ...rest } = shift;
        const baseStart = Shift.toDate(start);
        const baseEnd = Shift.toDate(end);
        for (const day of applyToWeekDays) {
          const column = dates.find((c) => dayjs(c).isoWeekday() === day);
          const newStart = dayjs(column)
            .hour(baseStart.hour())
            .minute(baseStart.minute());
          const newEnd = dayjs(column)
            .hour(baseEnd.hour())
            .minute(baseEnd.minute());
          // If end time is before start time, add a day to the end time
          const end = newEnd.isBefore(newStart) ? newEnd.add(1, "day") : newEnd;
          const newShift: WithFieldValue<IShift & FirebaseSignature> = {
            ...rest,
            start: Shift.toString(newStart.toDate()),
            end: Shift.toString(end.toDate()),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: user.uid,
            status: "draft",
          };
          initializeEmpShiftDoc.shifts = {
            ...initializeEmpShiftDoc.shifts,
            [`${day}-${id}`]: newShift,
          };
        }
        const shiftRef = doc(
          Firestore,
          "Organizations",
          location.organizationId,
          "shifts",
          `${weekId}_${employeeId}_${location.id}`
        );
        await setDoc(shiftRef, initializeEmpShiftDoc);
      } catch (error) {
        onError(error);
        throw error;
      }
    },
    [employeeShiftsCollection]
  );

  const cloneWeek = useCallback(
    async (targetWeekId: string, employees: string[]) => {
      const targetYear = Number.parseInt(targetWeekId.split("-")[2]);
      const targetWeekNo = Number.parseInt(targetWeekId.split("-")[1]);
      const firstDayTargetWeek = weekToDate(targetYear, targetWeekNo, 1);
      const weeksDiff = Math.abs(
        dayjs(firstDayTargetWeek).diff(weekDays[0], "weeks")
      );
      const allQueries = chunk(employees, 10).map((emps) =>
        getDocs(
          query(
            collection(
              Firestore,
              "Organizations",
              location.organizationId,
              "shifts"
            ),
            where("weekId", "==", targetWeekId),
            where("employeeId", "in", emps),
            where("locationId", "==", location.id)
          ).withConverter(EmployeeShifts.Converter)
        )
      );
      const exeQueries = await Promise.all(allQueries);
      const queriesDocs = exeQueries.flatMap((q) => q.docs);
      // ----------------------------------------------------------------
      const batch = writeBatch(Firestore);

      for (const targetWeekSnap of queriesDocs) {
        const targetWeekDoc = targetWeekSnap.data();
        const shifts: Record<
          string,
          WithFieldValue<IShift & FirebaseSignature>
        > = {};

        if (isEmpty(targetWeekDoc.shifts)) {
          continue;
        }

        const existentDoc = employeeShiftsCollection.find(
          (d) => d.employeeId === targetWeekDoc.employeeId
        );

        targetWeekDoc.shiftsArray
          .filter(
            (shift) =>
              shift.status === "published" && // Only clone published shifts
              isEmpty(existentDoc?.shifts?.[shift.id]) && // Only clone if the shift doesn't exist
              !shift.deleting && // Only clone if the shift is not being deleted
              !shift.hasPendingUpdates // Only clone if the shift doesn't have pending updates
          )
          .forEach((shift) => {
            // Adjust the shift to the current week
            const newStart = shift.getStartDayjsDate.add(weeksDiff, "weeks");
            const newEnd = shift.getEndDayjsDate.add(weeksDiff, "weeks");
            const newShift: WithFieldValue<IShift & FirebaseSignature> = {
              ...shift,
              start: Shift.toString(newStart.toDate()),
              end: Shift.toString(newEnd.toDate()),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              createdBy: user.uid,
              status: "draft",
            };
            shifts[shift.id] = newShift;
          });

        if (isEmpty(shifts)) {
          continue;
        }

        if (existentDoc) {
          batch.set(
            existentDoc.docRef,
            { shifts, updatedAt: serverTimestamp() },
            { merge: true }
          );
        } else {
          const shiftRef = doc(
            Firestore,
            "Organizations",
            location.organizationId,
            "shifts",
            `${weekId}_${targetWeekDoc.employeeId}_${location.id}`
          );
          batch.set(
            shiftRef,
            {
              shifts,
              updatedAt: serverTimestamp(),
              employeeId: targetWeekDoc.employeeId,
              weekId,
              locationId: location.id,
            },
            { merge: true }
          );
        }
      }

      await batch.commit();
    },
    [employeeShiftsCollection]
  );

  /**
   * Get the updates count for the week
   */
  const updatesCount = useMemo(() => {
    let newOrDraft = 0;
    let deleted = 0;
    let pendingUpdates = 0;

    for (const { shiftsArray } of employeeShiftsCollection ?? []) {
      if (!shiftsArray?.length) {
        continue;
      }

      for (const shift of shiftsArray) {
        if (shift.status === "draft" && !shift.hasPendingUpdates) {
          newOrDraft++;
          continue;
        }
        if (shift.deleting) {
          deleted++;
          continue;
        }
        if (shift.hasPendingUpdates) {
          pendingUpdates++;
          continue;
        }
      }
    }
    return {
      newOrDraft,
      deleted,
      pendingUpdates,
      total: newOrDraft + deleted + pendingUpdates,
    };
  }, [employeeShiftsCollection]);

  return (
    <ShiftContext.Provider
      value={{
        weekId,
        setWeekId,
        scheduleDocument,
        scheduleDocumentLoading,
        employeeShiftsCollection,
        shiftsCollectionLoading,
        weekDays,
        scheduleSummary,
        publish,
        searchQuery,
        setSearchQuery,
        selectedTag,
        setSelectedTag,
        editProjectedSales,
        createShift,
        updatesCount,
        loading: Boolean(
          scheduleDocumentLoading || shiftsCollectionLoading || loading
        ),
        error: sdError ?? scError ?? error ?? undefined,
        cloneWeek,
        scheduleSettingsData,
      }}
    >
      {typeof children === "function"
        ? children({
            scheduleDoc: scheduleDocument,
            employeeShiftsCollection: employeeShiftsCollection,
            loading: Boolean(
              scheduleDocumentLoading || shiftsCollectionLoading || loading
            ),
            error: sdError ?? scError ?? error,
          })
        : children}
    </ShiftContext.Provider>
  );
}

export const useSchedule = () => useContext(ShiftContext);
