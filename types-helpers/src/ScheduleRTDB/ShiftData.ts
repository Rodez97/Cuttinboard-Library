import {
  getShiftBaseWage,
  getShiftDayjsDate,
  getShiftDuration,
  getShiftLatestData,
  IShift,
  WageOptions,
} from "./Shift";
import { isEmpty } from "lodash";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import duration from "dayjs/plugin/duration";
import isBetween from "dayjs/plugin/isBetween";
import { areIntervalsOverlapping } from "date-fns";
import { IScheduleSettings } from "./ScheduleSettings";
import { IScheduleDoc } from "./ScheduleDoc";
dayjs.extend(isoWeek);
dayjs.extend(duration);
dayjs.extend(isBetween);

export type WeekSchedule = {
  shifts: {
    [employeeId: string]: {
      [shiftId: string]: IShift;
    };
  };
  summary: IScheduleDoc;
};

export type EmployeeShiftsItem = [string, [string, IShift][]];

/**
 * An interface that defines the properties of an object representing the shifts for a specific employee in a given week.
 */
export type ShiftData = {
  [organizationId: string]: {
    [locationId: string]: {
      [weekId: string]: WeekSchedule;
    };
  };
};

/**
 * Wage and hour data for an employee for a given ISO week day number.
 */
export type WageDataByDay = {
  /**
   * ISO week day number
   */
  [weekday: number]: {
    /**
     * Number of hours worked without overtime
     */
    normalHours: number;
    /**
     * Number of overtime hours worked
     */
    overtimeHours: number;
    /**
     * The sum of the normal and overtime hours
     */
    totalHours: number;
    /**
     * The total wage for normal hours
     */
    normalWage: number;
    /**
     * The wage for overtime hours
     */
    overtimeWage: number;
    /**
     * The total wage for the day
     * - normalWage + overtimeWage
     */
    totalWage: number;
    /**
     * Number of shifts for the day
     */
    totalShifts: number;
    /**
     * How many people were scheduled for the day
     */
    people: number;
  };
};

/**
 * Calculate the overtime rate of pay
 * @param multiplier Multiplier for the wage
 */
export function getOvertimeRateOfPay(
  shiftsArray: IShift[],
  multiplier: number
) {
  // Check if there are any shifts
  if (!shiftsArray.length) {
    return 0;
  }
  // Get total hours from shifts array
  const totalHours = shiftsArray.reduce(
    (acc, shift) => acc + getShiftDuration(shift).totalHours,
    0
  );
  // Get total wage from shifts array
  const totalWage = shiftsArray.reduce(
    (acc, shift) => acc + getShiftBaseWage(shift),
    0
  );
  // Calculate the regular rate of pay
  const regularRateOfPay = totalWage / totalHours;
  return regularRateOfPay * (multiplier - 1);
}

/**
 * Check is the employee's schedule have any changes or is unpublished
 */
export function checkShiftObjectChanges(
  weekEmployeeSchedule: WeekSchedule["shifts"][string]
): boolean {
  if (!weekEmployeeSchedule || Object.keys(weekEmployeeSchedule).length === 0) {
    return false;
  }
  return Object.values(weekEmployeeSchedule).some((shift) =>
    Boolean(
      !isEmpty(shift.pendingUpdate) ||
        shift.deleting ||
        shift.status === "draft"
    )
  );
}

/**
 * Check is the employee's schedule have any changes or is unpublished
 */
export function checkShiftArrayChanges([
  ,
  shifts,
]: EmployeeShiftsItem): boolean {
  return shifts.some(([, shift]) =>
    Boolean(
      !isEmpty(shift.pendingUpdate) ||
        shift.deleting ||
        shift.status === "draft"
    )
  );
}

/**
 * Check if a new shift start or end time overlaps with an existing shift
 * @param start - The start time of the new shift
 * @param end - The end time of the new shift
 * @param shiftId - The id of the shift to ignore
 */
export function checkForOverlappingShifts(
  weekEmployeeSchedule: WeekSchedule["shifts"][string],
  start: dayjs.Dayjs,
  end: dayjs.Dayjs,
  shiftId: string
): boolean {
  const shiftsArray = weekEmployeeSchedule
    ? Object.values(weekEmployeeSchedule)
    : [];

  // Check if there are any shifts
  if (!shiftsArray.length) {
    return false;
  }

  // Check if the new shift start or end time overlaps with an existing shift
  return shiftsArray.some((shiftRaw) => {
    // Check if the shift is the same shift
    if (shiftRaw.id === shiftId) {
      return false;
    }

    const shift = getShiftLatestData(shiftRaw);

    const shiftStart = getShiftDayjsDate(shift, "start");
    const shiftEnd = getShiftDayjsDate(shift, "end");

    return areIntervalsOverlapping(
      { start: start.toDate(), end: end.toDate() },
      {
        start: shiftStart.toDate(),
        end: shiftEnd.toDate(),
      }
    );
  });
}

export function checkForOverlappingShiftsARRAY(
  [, shifts]: EmployeeShiftsItem,
  start: dayjs.Dayjs,
  end: dayjs.Dayjs,
  shiftId: string
): boolean {
  // Check if there are any shifts
  if (!shifts.length) {
    return false;
  }

  // Check if the new shift start or end time overlaps with an existing shift
  return shifts.some(([shiftRawId, shiftRaw]) => {
    // Check if the shift is the same shift
    if (shiftId === shiftRawId) {
      return false;
    }

    const shift = getShiftLatestData(shiftRaw);

    const shiftStart = getShiftDayjsDate(shift, "start");
    const shiftEnd = getShiftDayjsDate(shift, "end");

    return areIntervalsOverlapping(
      { start: start.toDate(), end: end.toDate() },
      {
        start: shiftStart.toDate(),
        end: shiftEnd.toDate(),
      }
    );
  });
}

export function getEmployeeShiftsSummary(
  data: WageDataByDay
): WageDataByDay[number] {
  const result: WageDataByDay[number] = {
    normalHours: 0,
    overtimeHours: 0,
    totalHours: 0,
    normalWage: 0,
    overtimeWage: 0,
    totalWage: 0,
    totalShifts: 0,
    people: 0,
  };

  Object.values(data).forEach((day) => {
    result.normalHours += day.normalHours;
    result.overtimeHours += day.overtimeHours;
    result.totalHours += day.totalHours;
    result.normalWage += day.normalWage;
    result.overtimeWage += day.overtimeWage;
    result.totalWage += day.totalWage;
    result.totalShifts += day.totalShifts;
    result.people += day.people;
  });

  return result;
}

export function getWageOptions(
  shiftSettings: IScheduleSettings | undefined
): WageOptions | undefined {
  if (!shiftSettings) {
    return;
  }

  const { ot_week, ot_day } = shiftSettings;

  if (ot_week?.enabled) {
    return {
      mode: "weekly",
      hoursLimit: ot_week.hours,
      multiplier: ot_week.multiplier,
    };
  }

  if (ot_day?.enabled) {
    return {
      mode: "daily",
      hoursLimit: ot_day.hours,
      multiplier: ot_day.multiplier,
    };
  }
}
