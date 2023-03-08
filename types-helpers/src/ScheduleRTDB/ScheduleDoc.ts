import { parseWeekId, weekToDate } from "./helpers";
import { WageDataByDay } from "./ShiftData";
import { WeekSummary } from "./WeekSummary";

/**
 * The interface implemented by the ScheduleDoc class.
 */
export interface IScheduleDoc {
  year: number;
  weekNumber: number;
  projectedSalesByDay?: Record<number, number>;
  scheduleSummary: WeekSummary;
  createdAt: number;
  updatedAt?: number;
  publishData?: {
    publishedAt: number;
    notificationRecipients?: string[];
  };
}

/**
 * Get the first day of the week.
 */
export function getScheduleWeekStart(year: number, weekNumber: number): Date {
  const firstDayWeek = weekToDate(year, weekNumber);
  return firstDayWeek.toDate();
}

/**
 * Get the sum of the projected sales for the week.
 */
export function getScheduleTotalProjectedSales(sd: IScheduleDoc): number {
  return sd.projectedSalesByDay
    ? Object.values(sd.projectedSalesByDay).reduce((acc, curr) => acc + curr, 0)
    : 0;
}

/**
 * Get the wage and hours summary of the week's schedule.
 * @param day The day of the week to get the summary for.
 */
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

/**
 * Creates a Default ScheduleDoc for a given week.
 */
export function createDefaultScheduleDoc(weekId: string): IScheduleDoc {
  const { week, year } = parseWeekId(weekId);
  return {
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
  };
}
