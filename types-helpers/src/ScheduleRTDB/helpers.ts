import dayjs from "dayjs";
import {
  calculateWageData,
  calculateWageDataFromArray,
  WageDataRecord,
  WeekInfo,
} from "./Shift";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  EmployeeShiftsItem,
  getEmployeeShiftsSummary,
  getWageOptions,
  WageDataByDay,
  WeekSchedule,
} from "./ShiftData";
import { IScheduleSettings } from "./ScheduleSettings";
import { getScheduleTotalProjectedSales, IScheduleDoc } from "./ScheduleDoc";
dayjs.extend(isoWeek);

/**
 * Returns the first day of the week for a given year and week number.
 * @param year The year to get the week for.
 * @param isoWeekNo The week number to get the week for.
 * @returns The first day of the week.
 */
export function weekToDate(year: number, isoWeekNo: number): dayjs.Dayjs {
  if (year < 1970 || year > 2038) {
    throw new Error("Invalid year");
  }

  if (isoWeekNo < 1 || isoWeekNo > 53) {
    throw new Error("Invalid week number");
  }

  const firstDay = dayjs()
    .year(year)
    .month(0)
    .isoWeek(isoWeekNo)
    .startOf("isoWeek");
  return firstDay;
}

/**
 * Parses a week id into a WeekInfo object.
 * @param weekId The week id to parse.
 */
export function parseWeekId(weekId: string): WeekInfo {
  const weekInfo = weekId.split("-");
  const week = parseInt(weekInfo[1]);
  if (isNaN(week)) {
    throw new Error(`Invalid week id: ${weekId}`);
  }
  const year = parseInt(weekInfo[2]);
  if (isNaN(year)) {
    throw new Error(`Invalid week id: ${weekId}`);
  }
  const start = weekToDate(year, week);
  const end = start.endOf("isoWeek");
  return { year, week, start, end };
}

/**
 * Converts a number of minutes to a text duration.
 * @param totalMinutes The number of minutes to convert.
 * @returns The text duration. Example: 1h 30min
 */
export function minutesToTextDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) {
    return "0h 0min";
  }
  const hours = Math.floor(totalMinutes / 60);
  let minutes: string | number = totalMinutes % 60;
  minutes = minutes.toFixed(0);
  return `${hours}h ${minutes}min`;
}

/**
 * Gets the range of dates for a given week id.
 * @param weekId The week id to get the range for.
 * @returns The range of dates for the week.
 */
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

/**
 * This function takes a list of shifts and returns an object with the number
 * of new or draft shifts, the number of deleted shifts, the number of shifts
 * with pending updates, and the total number of shifts with any of the above
 * statuses.
 * @param employeeShifts The list of shifts to count.
 * @returns The number of new or draft shifts, the number of deleted shifts,
 */
export const getUpdatesCount = (employeeShifts: WeekSchedule["shifts"]) => {
  let newOrDraft = 0;
  let deleted = 0;
  let pendingUpdates = 0;

  const shiftsArray = employeeShifts ? Object.values(employeeShifts) : [];

  if (!shiftsArray.length) {
    return { newOrDraft, deleted, pendingUpdates, total: 0 };
  }

  for (const shiftData of shiftsArray) {
    if (!Object.keys(shiftData).length) {
      continue;
    }

    for (const shiftId in shiftData) {
      const shift = shiftData[shiftId];
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
  }

  return {
    newOrDraft,
    deleted,
    pendingUpdates,
    total: newOrDraft + deleted + pendingUpdates,
  };
};

export const getUpdatesCountFromArray = (
  employeeShifts: EmployeeShiftsItem[]
) => {
  let newOrDraft = 0;
  let deleted = 0;
  let pendingUpdates = 0;

  if (!employeeShifts.length) {
    return { newOrDraft, deleted, pendingUpdates, total: 0 };
  }

  for (const shiftData of employeeShifts) {
    if (!shiftData[1].length) {
      continue;
    }

    for (const [, shift] of shiftData[1]) {
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
  }

  return {
    newOrDraft,
    deleted,
    pendingUpdates,
    total: newOrDraft + deleted + pendingUpdates,
  };
};

/**
 * This function returns an object containing the total wage for each employee
 * based on the shifts they are assigned to. The function takes in an object
 * containing the shifts for each employee, and an optional schedule settings
 * object which contains information about the wage rates for each employee.
 * @param employeeShifts The shifts for each employee.
 * @param scheduleSettings The schedule settings object.
 * @returns An object containing the total wage for each employee.
 */
export const getEmployeeShiftsWageData = (
  employeeShifts: WeekSchedule["shifts"],
  scheduleSettings?: IScheduleSettings
): Record<string, WageDataRecord> => {
  if (!employeeShifts) {
    return {};
  }
  const wageOptions = getWageOptions(scheduleSettings);
  const mapEmployeeShifts = Object.entries(employeeShifts).reduce(
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

export const getEmployeeShiftsWageDataFromArray = (
  employeeShifts: EmployeeShiftsItem[],
  scheduleSettings?: IScheduleSettings
): Record<string, WageDataRecord> => {
  if (!employeeShifts.length) {
    return {};
  }
  const wageOptions = getWageOptions(scheduleSettings);
  const mapEmployeeShifts = employeeShifts.reduce(
    (acc, [employeeId, shifts]) => {
      return {
        ...acc,
        [employeeId]: calculateWageDataFromArray(shifts, wageOptions),
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
