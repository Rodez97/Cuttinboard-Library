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
import { Auth, Firestore } from "../firebase";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import { chunk, isEmpty, uniq } from "lodash";
import {
  getDocs,
  PartialWithFieldValue,
  serverTimestamp,
  WithFieldValue,
  writeBatch,
} from "firebase/firestore";
import { useLocation } from "./Location";
import {
  ScheduleDoc,
  ScheduleDocConverter,
} from "../models/schedule/ScheduleDoc";
import { Schedule_DayStats } from "../models/schedule/Schedule_DayStats";
import { FirebaseError } from "firebase/app";
import { IShift } from "./../models/schedule/Shift";
import { useEmployeesList } from "./useEmployeesList";
import {
  EmployeeShifts,
  IEmployeeShifts,
} from "./../models/schedule/EmployeeShifts";
import { FirebaseSignature } from "models";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

export const WEEKFORMAT = "[W]-W-YYYY";

export const SHIFTFORMAT = "DD-MM-YYYY HH:mm";

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

export function getShiftDate(date: string) {
  return dayjs(date, SHIFTFORMAT);
}

export function getShiftString(date: Date) {
  return dayjs(date).format(SHIFTFORMAT);
}

interface ScheduleContextProps {
  weekId: string;
  setWeekId: React.Dispatch<React.SetStateAction<string>>;
  scheduleDocument: ScheduleDoc;
  scheduleDocumentLoading: boolean;
  employeeShiftsCollection: EmployeeShifts[];
  shiftsCollectionLoading: boolean;
  weekDays: Date[];
  scheduleSummary: {
    totalHours: number;
    totalShifts: number;
    totalPeople: number;
    totalWage: number;
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
  scheduleSummaryByDay: Record<number, Schedule_DayStats>;
  updatesCount: {
    newOrDraft: number;
    deleted: number;
    pendingUpdates: number;
    total: number;
  };
  cloneWeek: (targetWeekId: string, employees: string[]) => Promise<void>;
  loading: boolean;
  error: Error;
}

interface ScheduleProviderProps {
  children:
    | ReactNode
    | ((props: {
        scheduleDoc: ScheduleDoc;
        employeeShiftsCollection: EmployeeShifts[];
        error: Error;
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
  const { getEmployees } = useEmployeesList();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>(null);
  const [scheduleDocument, scheduleDocumentLoading, sdError] =
    useDocumentData<ScheduleDoc>(
      doc(
        Firestore,
        location.docRef.path,
        "scheduleDocs",
        weekId
      ).withConverter(ScheduleDocConverter)
    );
  const [employeeShiftsCollection, shiftsCollectionLoading, scError] =
    useCollectionData<EmployeeShifts>(
      query(
        collection(Firestore, location.docRef.path, "shifts"),
        where("weekId", "==", weekId)
      ).withConverter(EmployeeShifts.Converter)
    );

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

  const scheduleSummary = useCallback(
    (empShifts: EmployeeShifts[] = employeeShiftsCollection) => {
      if (!empShifts || !Boolean(empShifts.length)) {
        return { totalHours: 0, totalShifts: 0, totalPeople: 0, totalWage: 0 };
      }
      const { time, wage, totalShifts } = empShifts.reduce<{
        time: duration.Duration;
        wage: number;
        totalShifts: number;
      }>(
        (acc, empShiftDoc) => {
          const { time, wage, totalShifts } = acc;
          return {
            time: time.add(empShiftDoc.userSummary.totalHours, "hours"),
            wage: wage + empShiftDoc.userSummary.totalWage,
            totalShifts: totalShifts + empShiftDoc.userSummary.totalShifts,
          };
        },
        { time: dayjs.duration(0), wage: 0, totalShifts: 0 }
      );
      const totalHours = time.asHours();
      const totalPeople = empShifts.length;
      return { totalHours, totalShifts, totalPeople, totalWage: wage };
    },
    [employeeShiftsCollection]
  );

  const scheduleSummaryByDay = useMemo((): Record<
    number,
    Schedule_DayStats
  > => {
    if (
      !employeeShiftsCollection ||
      !Boolean(employeeShiftsCollection.length)
    ) {
      return {};
    }
    return employeeShiftsCollection.reduce<Record<number, Schedule_DayStats>>(
      (acc, shiftDoc) => {
        const totalSummaryByDay: Record<number, Schedule_DayStats> = acc;
        Object.entries(shiftDoc.summaryByDay).forEach(([day, summ]) => {
          const prevShiftData = acc[Number.parseInt(day)];
          totalSummaryByDay[Number.parseInt(day)] = {
            hours: (prevShiftData?.hours ?? 0) + summ.hours,
            shifts: (prevShiftData?.shifts ?? 0) + summ.shifts,
            people: (prevShiftData?.people ?? 0) + summ.people,
            wages: (prevShiftData?.wages ?? 0) + summ.wages,
          };
        });
        return totalSummaryByDay;
      },
      {}
    );
  }, [employeeShiftsCollection]);

  const publish = useCallback(
    async (
      notificationRecipients: "all" | "all_scheduled" | "changed" | "none"
    ) => {
      if (
        !employeeShiftsCollection ||
        !Boolean(employeeShiftsCollection.length)
      ) {
        return;
      }
      let notiRecipients: string[] = [];
      if (notificationRecipients === "all") {
        notiRecipients = getEmployees.map((e) => e.id);
      }
      if (notificationRecipients === "all_scheduled") {
        notiRecipients = employeeShiftsCollection.map(
          (shift) => shift.employeeId
        );
      }
      if (notificationRecipients === "changed") {
        notiRecipients = employeeShiftsCollection
          .filter((empShiftDoc) => empShiftDoc.haveChanges)
          .map((shift) => shift.employeeId);
      }
      try {
        const batch = writeBatch(Firestore);
        employeeShiftsCollection.forEach((shiftsDoc) =>
          shiftsDoc.batchPublish(batch)
        );
        const stats = scheduleSummary();
        batch.set(
          doc(Firestore, location.docRef.path, "scheduleDocs", weekId),
          {
            weekId,
            stats,
            locationId: location.id,
            organizationId: location?.organizationId,
            statsByDay: scheduleSummaryByDay,
            year: Number.parseInt(weekId.split("-")[2]),
            weekNumber: Number.parseInt(weekId.split("-")[1]),
            month: weekToDate(
              Number.parseInt(weekId.split("-")[2]),
              Number.parseInt(weekId.split("-")[1])
            ).getMonth(),
            notificationRecipients: uniq(notiRecipients),
            updatedAt: serverTimestamp(),
          },
          {
            merge: true,
          }
        );
        await batch.commit();
      } catch (error) {
        onError(error);
        throw error;
      }
    },
    [weekId, scheduleSummary, location, scheduleSummaryByDay]
  );

  const editProjectedSales = useCallback(
    async (projectedSalesByDay: Record<number, number>) => {
      const updates: Record<number, Partial<Schedule_DayStats>> = {};
      Object.entries(projectedSalesByDay).forEach(([weekDay, sales]) => {
        updates[Number(weekDay)] = { projectedSales: sales };
      });
      try {
        await setDoc(
          doc(Firestore, location.docRef.path, "scheduleDocs", weekId),
          {
            statsByDay: updates,
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
        (empShiftDoc) => empShiftDoc.id === `${weekId}_${employeeId}`
      );
      if (!isEmpty(employeeShiftDoc)) {
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
        };
        const { start, end, ...rest } = shift;
        const baseStart = getShiftDate(start);
        const baseEnd = getShiftDate(end);
        for (const day of applyToWeekDays) {
          const column = dates.find((c) => dayjs(c).isoWeekday() === day);
          const newStart = dayjs(column)
            .hour(baseStart.hour())
            .minute(baseStart.minute())
            .toDate();
          const newEnd = dayjs(column)
            .hour(baseEnd.hour())
            .minute(baseEnd.minute())
            .toDate();
          const newShift: WithFieldValue<IShift & FirebaseSignature> = {
            ...rest,
            start: getShiftString(newStart),
            end: getShiftString(newEnd),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: Auth.currentUser.uid,
            status: "draft",
          };
          initializeEmpShiftDoc.shifts = {
            ...initializeEmpShiftDoc.shifts,
            [`${day}-${id}`]: newShift,
          };
        }
        const shiftRef = doc(
          Firestore,
          location.docRef.path,
          "shifts",
          `${weekId}_${employeeId}`
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
      // Obtener todos los documentos de los usuarios de la semana que se quiere
      const allQueries = chunk(employees, 10).map((emps) =>
        getDocs(
          query(
            collection(Firestore, location.docRef.path, "shifts"),
            where("weekId", "==", targetWeekId),
            where("employeeId", "in", emps)
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

        Object.entries(targetWeekDoc.shifts).forEach(([shiftId, shift]) => {
          if (
            shift.status === "published" &&
            isEmpty(existentDoc?.shifts?.[shiftId])
          ) {
            shifts[shiftId] = {
              ...shift,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              createdBy: Auth.currentUser.uid,
              status: "draft",
            };
          }
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
            location.docRef.path,
            "shifts",
            `${weekId}_${targetWeekDoc.employeeId}`
          );
          batch.set(
            shiftRef,
            {
              shifts,
              updatedAt: serverTimestamp(),
              employeeId: targetWeekDoc.employeeId,
              weekId,
            },
            { merge: true }
          );
        }
      }

      await batch.commit();
    },
    [employeeShiftsCollection]
  );

  const updatesCount = useMemo(() => {
    let newOrDraft = 0;
    let deleted = 0;
    let pendingUpdates = 0;

    for (const { shiftsArray } of employeeShiftsCollection ?? []) {
      if (!Boolean(shiftsArray?.length)) {
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
        scheduleSummary: scheduleSummary(),
        publish,
        searchQuery,
        setSearchQuery,
        selectedTag,
        setSelectedTag,
        editProjectedSales,
        createShift,
        scheduleSummaryByDay,
        updatesCount,
        loading: Boolean(scheduleDocumentLoading || shiftsCollectionLoading),
        error: sdError ?? scError,
        cloneWeek,
      }}
    >
      {typeof children === "function"
        ? children({
            scheduleDoc: scheduleDocument,
            employeeShiftsCollection: employeeShiftsCollection,
            loading: Boolean(
              scheduleDocumentLoading || shiftsCollectionLoading
            ),
            error: sdError ?? scError,
          })
        : children}
    </ShiftContext.Provider>
  );
}

export const useSchedule = () => useContext(ShiftContext);
