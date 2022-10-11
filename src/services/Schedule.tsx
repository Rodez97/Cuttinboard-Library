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
import { groupBy, uniq, uniqBy } from "lodash";
import { FieldValue, serverTimestamp, writeBatch } from "firebase/firestore";
import { useLocation } from "./Location";
import { Shift } from "../models/schedule/Shift";
import {
  ScheduleDoc,
  ScheduleDocConverter,
} from "../models/schedule/ScheduleDoc";
import { Schedule_DayStats } from "../models/schedule/Schedule_DayStats";
import { FirebaseError } from "firebase/app";
import { IShift } from "./../models/schedule/Shift";
import { useEmployeesList } from "./useEmployeesList";
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
  shiftsCollection: Shift[];
  shiftsCollectionLoading: boolean;
  weekDays: Date[];
  isPublished: boolean;
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
    shift: Partial<IShift<FieldValue>>,
    baseColumns: Date[],
    applyTo: number[],
    newId: string
  ) => Promise<void>;
  scheduleSummaryByDay: Record<number, Schedule_DayStats>;
  updatesCount: {
    newOrDraft: number;
    deleted: number;
    pendingUpdates: number;
    total: number;
  };
}

interface ScheduleProviderProps {
  children: ReactNode;
  LoadingElement: JSX.Element;
  ErrorElement: (error: FirebaseError) => JSX.Element;
}

const ShiftContext = createContext<ScheduleContextProps>(
  {} as ScheduleContextProps
);

export function ScheduleProvider({
  children,
  LoadingElement,
  ErrorElement,
}: ScheduleProviderProps) {
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
  const [shiftsCollection, shiftsCollectionLoading, scError] =
    useCollectionData<Shift>(
      query(
        collection(Firestore, location.docRef.path, "shifts"),
        where("altId", "in", [weekId, "repeat"])
      ).withConverter(Shift.Converter)
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

  const isPublished = useMemo(
    () => Boolean(scheduleDocument?.isPublished),
    [scheduleDocument]
  );

  const scheduleSummary = useCallback(
    (shifts: Shift[] = shiftsCollection) => {
      if (!shifts) {
        return { totalHours: 0, totalShifts: 0, totalPeople: 0, totalWage: 0 };
      }
      const { time, wage } = shifts?.reduce<{
        time: duration.Duration;
        wage: number;
      }>(
        (acc, shift) => {
          const { time, wage } = acc;
          return {
            time: time.add(shift.shiftDuration.totalMinutes, "minutes"),
            wage: wage + shift.getWage,
          };
        },
        { time: dayjs.duration(0), wage: 0 }
      );
      const totalHours = time.asHours();
      const totalShifts = shifts?.length;
      const totalPeople = uniqBy(shifts, (cs) => cs.employeeId).length ?? 0;
      return { totalHours, totalShifts, totalPeople, totalWage: wage };
    },
    [shiftsCollection]
  );

  const scheduleSummaryByDay = useMemo((): Record<
    number,
    Schedule_DayStats
  > => {
    if (!shiftsCollection) {
      return {};
    }

    const shiftsByDay = groupBy(
      shiftsCollection,
      (shift) => shift.shiftIsoWeekday
    );

    return Object.entries(shiftsByDay)?.reduce<
      Record<number, Schedule_DayStats>
    >((acc, [weekDay, shifts]) => {
      const { totalHours, totalShifts, totalPeople, totalWage } =
        scheduleSummary(shifts);
      return {
        ...acc,
        [weekDay]: {
          hours: totalHours,
          shifts: totalShifts,
          people: totalPeople,
          wages: totalWage,
        },
      };
    }, {});
  }, [shiftsCollection]);

  const publish = useCallback(
    async (
      notificationRecipients: "all" | "all_scheduled" | "changed" | "none"
    ) => {
      let notiRecipients: string[] = [];
      if (notificationRecipients === "all") {
        notiRecipients = getEmployees.map((e) => e.id);
      }
      if (notificationRecipients === "all_scheduled") {
        notiRecipients = shiftsCollection.map((shift) => shift.employeeId);
      }
      if (notificationRecipients === "changed") {
        notiRecipients = shiftsCollection
          .filter(
            (shift) =>
              shift.hasPendingUpdates ||
              shift.deleting ||
              shift.status === "draft"
          )
          .map((shift) => shift.employeeId);
      }
      try {
        const batch = writeBatch(Firestore);
        shiftsCollection.forEach((shift) => shift.batchPublish(batch));
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
        throw error;
      }
    },
    [weekId, scheduleSummary, isPublished, location, scheduleSummaryByDay]
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
        throw error;
      }
    },
    [weekId]
  );

  const createShift = useCallback(
    async (
      shift: Partial<IShift<FieldValue>>,
      baseColumns: Date[],
      applyTo: number[],
      newId: string
    ) => {
      try {
        const { start, end, ...rest } = shift;
        const baseStart = getShiftDate(start);
        const baseEnd = getShiftDate(end);
        const batch = writeBatch(Firestore);
        for (const day of applyTo) {
          const column = baseColumns.find((c) => dayjs(c).isoWeekday() === day);
          const newStart = dayjs(column)
            .hour(baseStart.hour())
            .minute(baseStart.minute())
            .toDate();
          const newEnd = dayjs(column)
            .hour(baseEnd.hour())
            .minute(baseEnd.minute())
            .toDate();
          const shiftRef = doc(
            Firestore,
            location.docRef.path,
            "shifts",
            `${day}-${newId}`
          );
          batch.set(shiftRef, {
            ...rest,
            start: getShiftString(newStart),
            end: getShiftString(newEnd),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: "draft",
          });
        }
        await batch.commit();
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const updatesCount = useMemo(() => {
    let newOrDraft = 0;
    let deleted = 0;
    let pendingUpdates = 0;

    for (const shift of shiftsCollection ?? []) {
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
    return {
      newOrDraft,
      deleted,
      pendingUpdates,
      total: newOrDraft + deleted + pendingUpdates,
    };
  }, [shiftsCollection]);

  if (scheduleDocumentLoading || shiftsCollectionLoading) {
    return LoadingElement;
  }
  if (sdError || scError) {
    return ErrorElement(sdError ?? scError);
  }

  return (
    <ShiftContext.Provider
      value={{
        weekId,
        setWeekId,
        scheduleDocument,
        scheduleDocumentLoading,
        shiftsCollection,
        shiftsCollectionLoading,
        weekDays,
        isPublished,
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
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
}

export const useSchedule = () => useContext(ShiftContext);
