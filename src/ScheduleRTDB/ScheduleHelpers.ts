import {
  DocumentData,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { generateOrderFactor } from "./Shift";
import { parseWeekId, weekToDate } from "./scheduleMathHelpers";
import {
  IScheduleDoc,
  WageDataByDay,
} from "@cuttinboard-solutions/types-helpers";

export const scheduleConverter = {
  toFirestore(object: PartialWithFieldValue<IScheduleDoc>): DocumentData {
    return { ...object, updatedAt: new Date().getTime() };
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IScheduleDoc>,
    options: SnapshotOptions
  ): IScheduleDoc {
    const { id } = value;
    const rawData = value.data(options);
    return {
      ...rawData,
      id,
    };
  },
};

export function getScheduleWeekStart(year: number, weekNumber: number): Date {
  const firstDayWeek = weekToDate(year, weekNumber);
  return firstDayWeek.toDate();
}

export function getScheduleTotalProjectedSales(sd: IScheduleDoc): number {
  return sd.projectedSalesByDay
    ? Object.values(sd.projectedSalesByDay).reduce((acc, curr) => acc + curr, 0)
    : 0;
}

export function getScheduleSummaryByDay(
  sd: IScheduleDoc,
  day: number
): WageDataByDay[number] {
  // Check if the day is in the week
  if (day < 1 || day > 7) {
    throw new Error("Day must be between 1 and 7");
  }
  // Check if the day exists in the summary
  if (!sd.scheduleSummary?.byDay?.[day]) {
    // If not, return default values
    return {
      normalHours: 0,
      overtimeHours: 0,
      totalHours: 0,
      normalWage: 0,
      overtimeWage: 0,
      totalWage: 0,
      people: 0,
      totalShifts: 0,
    };
  }
  // If it does, return the day's summary
  return sd.scheduleSummary.byDay[day];
}

export function createDefaultScheduleDoc(
  weekId: string,
  locationId: string
): IScheduleDoc {
  const { week, year } = parseWeekId(weekId);
  return {
    id: "",
    year,
    weekNumber: week,
    updatedAt: new Date().getTime(),
    createdAt: new Date().getTime(),
    scheduleSummary: {
      total: {
        normalHours: 0,
        overtimeHours: 0,
        totalHours: 0,
        normalWage: 0,
        overtimeWage: 0,
        totalWage: 0,
        totalPeople: 0,
        totalShifts: 0,
        projectedSales: 0,
        laborPercentage: 0,
      },
      byDay: {},
    },
    locationId,
    weekId,
    weekOrderFactor: generateOrderFactor(weekId),
  };
}
