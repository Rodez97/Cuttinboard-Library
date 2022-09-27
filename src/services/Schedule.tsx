import {
  collection,
  doc,
  DocumentReference,
  Query,
  query,
  where,
  setDoc,
  orderBy as orderByFirestore,
} from "@firebase/firestore";
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
import { groupBy, orderBy, uniqBy } from "lodash";
import { Employee, EmployeeConverter } from "../models/Employee";
import { writeBatch } from "firebase/firestore";
import { useLocation } from "./Location";
import { Shift, ShiftConverter } from "../models/schedule/Shift";
import {
  ScheduleDoc,
  ScheduleDocConverter,
} from "../models/schedule/ScheduleDoc";
import { Schedule_DayStats } from "../models/schedule/Schedule_DayStats";
import { FirebaseError } from "firebase/app";
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
  togglePublish: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedTag: string;
  setSelectedTag: React.Dispatch<React.SetStateAction<string>>;
  scheduleEmployees: Employee[];
  editProjectedSales: (
    projectedSalesByDay: Record<number, number>
  ) => Promise<void>;
  createShift: (
    shift: Partial<Shift>,
    baseColumns: Date[],
    applyTo: number[],
    newId: string
  ) => Promise<void>;
  editShift: (shift: Partial<Shift>) => Promise<void>;
  scheduleSummaryByDay: Record<number, Schedule_DayStats>;
  employees: Employee[];
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
  const { locationDocRef, locationId, location } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>(null);
  const { getEmployees } = useEmployeesList();
  const [scheduleDocument, scheduleDocumentLoading, sdError] =
    useDocumentData<ScheduleDoc>(
      doc(Firestore, locationDocRef.path, "scheduleDocs", weekId).withConverter(
        ScheduleDocConverter
      )
    );
  const [shiftsCollection, shiftsCollectionLoading, scError] =
    useCollectionData<Shift>(
      query(
        collection(Firestore, locationDocRef.path, "shifts"),
        where("altId", "in", [weekId, "repeat"])
      ).withConverter(ShiftConverter)
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
          const start = getShiftDate(shift.start);
          const end = getShiftDate(shift.end);
          const duration = end.diff(start, "minutes");
          const hours = duration / 60;
          const { time, wage } = acc;
          return {
            time: time.add(duration, "minutes"),
            wage: wage + (shift.hourlyWage ?? 0) * hours,
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

    const shiftsByDay = groupBy(shiftsCollection, (shift) =>
      getShiftDate(shift.start).isoWeekday()
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

  const togglePublish = useCallback(async () => {
    try {
      const stats = scheduleSummary();
      await setDoc<Partial<ScheduleDoc>>(
        doc(Firestore, locationDocRef.path, "scheduleDocs", weekId),
        {
          isPublished: !isPublished,
          weekId,
          stats,
          locationId,
          organizationId: location?.organizationId,
          statsByDay: scheduleSummaryByDay,
          year: Number.parseInt(weekId.split("-")[2]),
          weekNumber: Number.parseInt(weekId.split("-")[1]),
          month: weekToDate(
            Number.parseInt(weekId.split("-")[2]),
            Number.parseInt(weekId.split("-")[1])
          ).getMonth(),
        },
        {
          merge: true,
        }
      );
    } catch (error) {
      throw error;
    }
  }, [weekId, scheduleSummary, isPublished, location, scheduleSummaryByDay]);

  const scheduleEmployees = useMemo(() => {
    let fFilter = searchQuery
      ? getEmployees?.filter((emp) =>
          `${emp.name} ${emp?.lastName ?? ""}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
      : getEmployees;
    fFilter = selectedTag
      ? fFilter?.filter(
          (e) =>
            e.role === "employee" &&
            e.locations?.[locationId]?.pos?.includes(selectedTag)
        )
      : fFilter;
    return orderBy(fFilter, "name");
  }, [searchQuery, getEmployees, selectedTag]);

  const editProjectedSales = useCallback(
    async (projectedSalesByDay: Record<number, number>) => {
      const updates: Record<number, Partial<Schedule_DayStats>> = {};
      Object.entries(projectedSalesByDay).forEach(([weekDay, sales]) => {
        updates[Number(weekDay)] = { projectedSales: sales };
      });
      try {
        await setDoc(
          doc(Firestore, locationDocRef.path, "scheduleDocs", weekId),
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
      shift: Partial<Shift>,
      baseColumns: Date[],
      applyTo: number[],
      newId: string
    ) => {
      try {
        const { id, docRef, start, end, ...rest } = shift;
        const baseStart = getShiftDate(start);
        const baseEnd = getShiftDate(end);
        const batch = writeBatch(Firestore);
        for (const day of applyTo) {
          const column = baseColumns.find((c) => c.getDay() === day);
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
            locationDocRef.path,
            "shifts",
            `${day}-${newId}`
          );
          batch.set(shiftRef, {
            ...rest,
            start: getShiftString(newStart),
            end: getShiftString(newEnd),
          });
        }
        await batch.commit();
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const editShift = useCallback(async (shift: Partial<Shift>) => {
    try {
      await setDoc(
        doc(Firestore, locationDocRef.path, "shifts", shift.id),
        shift,
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }, []);

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
        togglePublish,
        searchQuery,
        setSearchQuery,
        selectedTag,
        setSelectedTag,
        scheduleEmployees,
        editProjectedSales,
        createShift,
        editShift,
        scheduleSummaryByDay,
        employees: getEmployees,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
}

export const useSchedule = () => useContext(ShiftContext);
