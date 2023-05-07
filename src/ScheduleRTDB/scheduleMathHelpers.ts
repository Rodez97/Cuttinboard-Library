import dayjs from "dayjs";
import { calculateWageData, IShift, WageDataRecord, WeekInfo } from "./Shift";
import isoWeek from "dayjs/plugin/isoWeek.js";
import { getScheduleTotalProjectedSales, IScheduleDoc } from "./ScheduleDoc";
import { groupBy } from "lodash";
import { setISOWeek, setYear } from "date-fns";
import { IScheduleSettings } from "./ScheduleSettings";
import {
  getEmployeeShiftsSummary,
  getWageOptions,
  WageDataByDay,
} from "./ShiftData";
dayjs.extend(isoWeek);

export function weekToDate(year: number, isoWeekNo: number): dayjs.Dayjs {
  if (year < 1970 || year > 2038) {
    throw new Error("Invalid year");
  }

  if (isoWeekNo < 1 || isoWeekNo > 53) {
    throw new Error("Invalid week number");
  }

  const baseDate = new Date();
  const fixedYear = setYear(baseDate, year);
  const fixedWeek = setISOWeek(fixedYear, isoWeekNo);

  return dayjs(fixedWeek).startOf("isoWeek");
}

export function parseWeekId(weekId: string): WeekInfo {
  const [week, year] = weekId.split("-").slice(1).map(Number);
  const start = weekToDate(year, week);
  const end = start.endOf("isoWeek");
  return { year, week, start, end };
}

export function getWeekFullNumberByDate(date: dayjs.Dayjs): number {
  const weekNumber = date.isoWeek() / 100;
  const year = date.year();
  return year + weekNumber;
}

export function minutesToTextDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) {
    return "0h 0min";
  }
  const hours = Math.floor(totalMinutes / 60);
  let minutes: string | number = totalMinutes % 60;
  minutes = minutes.toFixed(0);
  return `${hours}h ${minutes}min`;
}

export const getWeekDays = (weekId: string): dayjs.Dayjs[] => {
  const { start: weekStart } = parseWeekId(weekId);
  const weekDays: dayjs.Dayjs[] = [];

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const day = weekStart.add(dayIndex, "day");
    if (day.isSame(weekStart, "isoWeek")) {
      weekDays.push(day);
    }
  }

  return weekDays;
};

export const getUpdatesCount = (employeeShifts: IShift[] | undefined) => {
  let newOrDraft = 0;
  let deleted = 0;
  let pendingUpdates = 0;

  if (!employeeShifts || !employeeShifts.length) {
    return { newOrDraft, deleted, pendingUpdates, total: 0 };
  }

  for (const shift of employeeShifts) {
    const noOfChangedAttrs = shift.pendingUpdate
      ? Object.keys(shift.pendingUpdate).length
      : 0;
    if (shift.status === "draft" && !noOfChangedAttrs) {
      newOrDraft++;
    } else if (shift.deleting) {
      deleted++;
    } else if (noOfChangedAttrs > 0) {
      pendingUpdates++;
    }
  }

  return {
    newOrDraft,
    deleted,
    pendingUpdates,
    total: newOrDraft + deleted + pendingUpdates,
  };
};

export const getUpdatesCountFromArray = (employeeShifts: IShift[]) => {
  let newOrDraft = 0;
  let deleted = 0;
  let pendingUpdates = 0;

  if (!employeeShifts.length) {
    return { newOrDraft, deleted, pendingUpdates, total: 0 };
  }

  for (const shift of employeeShifts) {
    const noOfChangedAttrs = shift.pendingUpdate
      ? Object.keys(shift.pendingUpdate).length
      : 0;
    if (shift.status === "draft" && !noOfChangedAttrs) {
      newOrDraft++;
    } else if (shift.deleting) {
      deleted++;
    } else if (noOfChangedAttrs > 0) {
      pendingUpdates++;
    }
  }

  return {
    newOrDraft,
    deleted,
    pendingUpdates,
    total: newOrDraft + deleted + pendingUpdates,
  };
};

export const getEmployeeShiftsWageData = (
  employeeShifts: IShift[] | undefined,
  scheduleSettings?: IScheduleSettings
): Record<string, WageDataRecord> => {
  if (!employeeShifts || !employeeShifts.length) {
    return {};
  }
  const wageOptions = getWageOptions(scheduleSettings);
  const groupedByEmployee = groupBy(employeeShifts, "employeeId");
  const mapEmployeeShifts = Object.entries(groupedByEmployee).reduce(
    (acc, [employeeId, shifts]) => {
      return {
        ...acc,
        [employeeId]: calculateWageData(shifts, wageOptions),
      };
    },
    {} as Record<string, WageDataRecord>
  );
  return mapEmployeeShifts;
};

export const getWeekSummary = (
  wageData: Record<string, WageDataRecord>,
  scheduleDocument?: IScheduleDoc
) => {
  const totalProjectedSales = scheduleDocument
    ? getScheduleTotalProjectedSales(scheduleDocument)
    : 0;

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

  const employeeShiftsDocuments = wageData ? Object.values(wageData) : [];

  if (!employeeShiftsDocuments.length) {
    // If there are no shifts, return the default values
    return { total, byDay };
  }

  // Get the total of all summary fields
  employeeShiftsDocuments.forEach((shfDoc) => {
    const { summary } = shfDoc;
    const getFullSummary = getEmployeeShiftsSummary(summary);
    total.normalHours += getFullSummary.normalHours;
    total.overtimeHours += getFullSummary.overtimeHours;
    total.totalHours += getFullSummary.totalHours;
    total.normalWage += getFullSummary.normalWage;
    total.overtimeWage += getFullSummary.overtimeWage;
    total.totalWage += getFullSummary.totalWage;
    total.totalPeople += 1;
    total.totalShifts += getFullSummary.totalShifts;

    // Get the wage data by day
    Object.keys(summary).forEach((day) => {
      const parseDay = Number.parseInt(day);
      const dayData = summary[parseDay];
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
};
