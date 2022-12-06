import { collection, doc, query, where, setDoc } from "@firebase/firestore";
import React, {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";
import { FIRESTORE } from "../utils/firebase";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import { chunk, compact, isEmpty, uniq } from "lodash";
import {
  getDocs,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  serverTimestamp,
  WithFieldValue,
  writeBatch,
} from "firebase/firestore";
import { useEmployeesList } from "../employee/useEmployeesList";
import {
  EmployeeShifts,
  IEmployeeShifts,
  WageDataByDay,
} from "./EmployeeShifts";
import { FirebaseSignature } from "models";
import { WEEKFORMAT } from "../utils";
import { useCuttinboard } from "../services/useCuttinboard";
import { weekToDate } from "./weekToDate";
import { ScheduleSettings } from "./ScheduleSettings";
import { ScheduleDoc } from "./ScheduleDoc";
import { WeekSummary } from "./WeekSummary";
import { IShift, Shift } from "./Shift";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

const ScheduleFormDataConverter = {
  toFirestore: (data: ScheduleSettings) => data,
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<ScheduleSettings>
  ): ScheduleSettings => snapshot.data(),
};

export interface IScheduleContext {
  weekId: string;
  setWeekId: React.Dispatch<React.SetStateAction<string>>;
  scheduleDocument?: ScheduleDoc;
  employeeShiftsCollection: EmployeeShifts[];
  scheduleSettingsData?: ScheduleSettings;
  weekDays: Date[];
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
    dates: Date[],
    applyToWeekDays: number[],
    id: string,
    employeeId: string
  ) => Promise<void>;
  updates: {
    newOrDraft: number;
    deleted: number;
    pendingUpdates: number;
    total: number;
  };
  cloneWeek: (targetWeekId: string, employees: string[]) => Promise<void>;
}

interface IScheduleProvider {
  children:
    | ReactNode
    | ((props: {
        scheduleDocument?: ScheduleDoc;
        employeeShiftsCollection: EmployeeShifts[];
      }) => JSX.Element);
  ErrorRenderer: (err: Error) => ReactElement;
  LoadingRenderer: () => ReactElement;
}

export const ShiftContext = createContext<IScheduleContext>(
  {} as IScheduleContext
);

export function ScheduleProvider({
  children,
  ErrorRenderer,
  LoadingRenderer,
}: IScheduleProvider) {
  const [weekId, setWeekId] = useState(dayjs().format(WEEKFORMAT));
  const { user } = useCuttinboard();
  const { getEmployees } = useEmployeesList();
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState<string>("");
  const [scheduleDocument, scheduleDocumentLoading, sdError] =
    useDocumentData<ScheduleDoc>(
      globalThis.locationData
        ? doc(
            FIRESTORE,
            "Organizations",
            globalThis.locationData.organizationId,
            "scheduleDocs",
            `${weekId}_${globalThis.locationData.id}`
          ).withConverter(ScheduleDoc.firestoreConverter)
        : null,
      {
        initialValue: globalThis.locationData
          ? ScheduleDoc.createDefaultScheduleDoc(weekId)
          : undefined,
      }
    );
  const [employeeShiftsCollectionRaw, shiftsCollectionLoading, scError] =
    useCollectionData<EmployeeShifts>(
      globalThis.locationData
        ? query(
            collection(
              FIRESTORE,
              "Organizations",
              globalThis.locationData.organizationId,
              "shifts"
            ),
            where("weekId", "==", weekId),
            where("locationId", "==", globalThis.locationData.id)
          ).withConverter(EmployeeShifts.Converter)
        : null
    );
  // Get Schedule Settings from Firestore
  const [scheduleSettingsData, loading, error] =
    useDocumentData<ScheduleSettings>(
      globalThis.locationData
        ? doc(
            FIRESTORE,
            "Organizations",
            globalThis.locationData.organizationId,
            "settings",
            `schedule_${globalThis.locationData.id}`
          ).withConverter(ScheduleFormDataConverter)
        : null
    );

  // Initialize EmployeeShifts Collection with schedule settings
  const employeeShiftsCollection = useMemo(() => {
    if (
      loading ||
      shiftsCollectionLoading ||
      scheduleDocumentLoading ||
      !employeeShiftsCollectionRaw
    ) {
      return [];
    }

    // We initialize the collection with the default values
    let initializedCollection = employeeShiftsCollectionRaw.map((shift) => {
      shift.calculateWageData();
      return shift;
    });

    if (scheduleSettingsData) {
      // We check if the overtime settings are enabled
      if (scheduleSettingsData.ot_week.enabled) {
        const { hours, multiplier } = scheduleSettingsData.ot_week;
        initializedCollection = employeeShiftsCollectionRaw.map((shift) => {
          shift.calculateWageData({
            mode: "weekly",
            hoursLimit: hours,
            multiplier,
          });
          return shift;
        });
      } else if (scheduleSettingsData.ot_day.enabled) {
        const { hours, multiplier } = scheduleSettingsData.ot_day;
        initializedCollection = employeeShiftsCollectionRaw.map((shift) => {
          shift.calculateWageData({
            mode: "daily",
            hoursLimit: hours,
            multiplier,
          });
          return shift;
        });
      }
    }

    return initializedCollection;
  }, [scheduleSettingsData, employeeShiftsCollectionRaw]);

  const weekDays = useMemo(() => {
    const year = Number.parseInt(weekId.split("-")[2]);
    const weekNo = Number.parseInt(weekId.split("-")[1]);
    const firstDayWeek = weekToDate(year, weekNo, 1);
    const weekDays: Date[] = [];

    // Push the first day of the week to the array
    weekDays.push(firstDayWeek);

    // Push the remaining days of the week to the array
    for (let dayIndex = 1; dayIndex < 7; dayIndex++) {
      weekDays.push(dayjs(firstDayWeek).add(dayIndex, "days").toDate());
    }
    return weekDays;
  }, [weekId]);

  const weekSummary = useMemo((): WeekSummary => {
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
        throw new Error("No shifts to publish");
      }
      if (!globalThis.locationData) {
        throw new Error("No location data");
      }
      let notiRecipients: string[] = [];
      switch (notificationRecipients) {
        case "all":
          // Get all employees
          notiRecipients = getEmployees.map((e) => e.id);
          break;
        case "all_scheduled":
          // Get all employees that have shifts
          notiRecipients = employeeShiftsCollection
            .filter((e) => e.shiftsArray.length > 0)
            .map((shift) => shift.employeeId);
          break;
        case "changed":
          // Get all employees that have shifts and have changed shifts from the last published schedule
          notiRecipients = employeeShiftsCollection
            .filter((empShiftDoc) => empShiftDoc.haveChanges)
            .map((shift) => shift.employeeId);
          break;
        default:
          break;
      }
      // Publish the schedule
      const batch = writeBatch(FIRESTORE);
      employeeShiftsCollection.forEach((shiftsDoc) =>
        // Update the shifts document
        shiftsDoc.batchPublish(batch)
      );
      const [, weekNumber, year] = weekId.split("-").map(Number.parseInt);
      // Update the schedule document
      batch.set(
        doc(
          FIRESTORE,
          "Organizations",
          globalThis.locationData.organizationId,
          "scheduleDocs",
          `${weekId}_${globalThis.locationData.id}`
        ),
        {
          weekId,
          locationId: globalThis.locationData.id,
          year,
          weekNumber,
          notificationRecipients: uniq(notiRecipients),
          updatedAt: serverTimestamp(),
          scheduleSummary: weekSummary,
        },
        {
          merge: true,
        }
      );
      // Commit the batch
      await batch.commit();
    },
    [weekId, employeeShiftsCollection, weekSummary]
  );

  const createShift = useCallback(
    async (
      shift: IShift,
      dates: Date[],
      applyToWeekDays: number[],
      id: string,
      employeeId: string
    ) => {
      const locationId = globalThis.locationData?.id;
      if (!locationId || !globalThis.locationData) {
        throw new Error("No location data");
      }
      // Get the EmployeeShiftsDoc by id
      const employeeShiftDoc = employeeShiftsCollection.find(
        (empShiftDoc) =>
          empShiftDoc.id === `${weekId}_${employeeId}_${locationId}`
      );
      if (employeeShiftDoc && !isEmpty(employeeShiftDoc)) {
        await employeeShiftDoc.createShift(shift, dates, applyToWeekDays, id);
        return;
      }

      const initializeEmpShiftDoc: PartialWithFieldValue<
        IEmployeeShifts & FirebaseSignature
      > = {
        shifts: {},
        employeeId,
        weekId,
        updatedAt: serverTimestamp(),
        locationId,
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
        FIRESTORE,
        "Organizations",
        globalThis.locationData?.organizationId,
        "shifts",
        `${weekId}_${employeeId}_${locationId}`
      );
      await setDoc(shiftRef, initializeEmpShiftDoc);
    },
    [employeeShiftsCollection]
  );

  /**
   * This function is used to clone shifts from a target week to the current week for a given list of employees.
   * It first retrieves the shifts for the target week from the database and then creates new shifts for the current week by adjusting the dates of the retrieved shifts.
   * Finally, it updates the shifts for the current week in the database using a batch write.
   * 
   * Retrieve the target year and week number from the targetWeekId string
Calculate the first day of the target week using the weekToDate function
Calculate the number of weeks difference between the first day of the target week and the first day of the current week
Chunk the list of employees into groups of 10 and retrieve their shifts for the target week from the database
For each retrieved target week shift:
Check if the shift exists in the current week and if it is not being deleted or has pending updates
Adjust the shift start and end dates using the weeks difference calculated in step 3
Create a new shift for the current week using the adjusted dates
Update the shifts for the current week in the database using a batch write.
   */
  const cloneWeek = useCallback(
    async (targetWeekId: string, employees: string[]) => {
      if (!globalThis.locationData) {
        throw new Error("No location data");
      }

      const targetYear = Number.parseInt(targetWeekId.split("-")[2]);
      const targetWeekNo = Number.parseInt(targetWeekId.split("-")[1]);
      const firstDayTargetWeek = weekToDate(targetYear, targetWeekNo, 1);
      const weeksDiff = Math.abs(
        dayjs(firstDayTargetWeek).diff(weekDays[0], "weeks")
      );
      const allQueries = chunk(employees, 10).map((employeesChunk) => {
        if (!globalThis.locationData) {
          return; // Handle the error or return a default value here
        }

        return getDocs(
          query(
            collection(
              FIRESTORE,
              "Organizations",
              globalThis.locationData.organizationId,
              "shifts"
            ),
            where("weekId", "==", targetWeekId),
            where("employeeId", "in", employeesChunk),
            where("locationId", "==", globalThis.locationData.id)
          ).withConverter(EmployeeShifts.Converter)
        );
      });

      const exeQueries = await Promise.all(compact(allQueries));
      const queriesDocs = exeQueries.flatMap((q) => q.docs);
      // ----------------------------------------------------------------
      const batch = writeBatch(FIRESTORE);

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
            FIRESTORE,
            "Organizations",
            globalThis.locationData.organizationId,
            "shifts",
            `${weekId}_${targetWeekDoc.employeeId}_${globalThis.locationData.id}`
          );
          batch.set(
            shiftRef,
            {
              shifts,
              updatedAt: serverTimestamp(),
              employeeId: targetWeekDoc.employeeId,
              weekId,
              locationId: globalThis.locationData.id,
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

  if (scheduleDocumentLoading || shiftsCollectionLoading || loading) {
    return LoadingRenderer();
  }

  if (sdError) {
    return ErrorRenderer(sdError);
  }

  if (scError) {
    return ErrorRenderer(scError);
  }

  if (error) {
    return ErrorRenderer(error);
  }

  return (
    <ShiftContext.Provider
      value={{
        weekId,
        setWeekId,
        scheduleDocument,
        employeeShiftsCollection,
        weekDays,
        weekSummary,
        publish,
        searchQuery,
        setSearchQuery,
        position,
        setPosition,
        createShift,
        updates: updatesCount,
        cloneWeek,
        scheduleSettingsData,
      }}
    >
      {typeof children === "function"
        ? children({
            scheduleDocument,
            employeeShiftsCollection,
          })
        : children}
    </ShiftContext.Provider>
  );
}
