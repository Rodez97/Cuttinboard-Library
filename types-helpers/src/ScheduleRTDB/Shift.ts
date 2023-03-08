import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import { isEmpty } from "lodash";
import isBetween from "dayjs/plugin/isBetween";
import { SHIFTFORMAT } from "../utils";
import { getOvertimeRateOfPay, WageDataByDay, WeekSchedule } from "./ShiftData";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(duration);
dayjs.extend(isBetween);

export type WeekInfo = {
  year: number;
  week: number;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
};

export type WageOptions = {
  mode: "weekly" | "daily";
  hoursLimit: number;
  multiplier: number;
};

export type WageDataRecord = {
  summary: WageDataByDay;
  shifts: Map<
    string,
    {
      wageData: ShiftWage;
      isoWeekDay: number;
    }
  >;
};

export type ShiftWage = {
  normalHours: number;
  overtimeHours: number;
  totalHours: number;
  normalWage: number;
  overtimeWage: number;
  totalWage: number;
};

export interface IPrimaryShiftData {
  start: string;
  end: string;
  position?: string;
  notes?: string;
  hourlyWage?: number;
}

/**
 * Base interface implemented by Shift class.
 */
export interface IShift extends IPrimaryShiftData {
  id: string;
  status: "draft" | "published";
  pendingUpdate?: Partial<IPrimaryShiftData>;
  deleting?: boolean;
  updatedAt: number;
}

/**
 * A class that represents a shift in the database.
 */
export class Shift {
  /**
   * Parses a string into a dayjs date
   * @param {string} date date string
   */
  static toDate(date: string): Dayjs {
    return dayjs(date, SHIFTFORMAT);
  }

  /**
   * Converts a shift formatted Date to a string
   * @param {Date} date date to convert
   */
  static toString(date: Date): string {
    return dayjs(date).format(SHIFTFORMAT);
  }
}

/**
 * Get the start date as a dayjs date
 */
export function getShiftDayjsDate(
  shift: IShift,
  date: "start" | "end",
  latest: boolean = true
): Dayjs {
  if (latest && shift.pendingUpdate?.[date]) {
    return dayjs(shift.pendingUpdate[date], SHIFTFORMAT);
  }

  return dayjs(shift[date], SHIFTFORMAT);
}

/**
 * Get ISO week number of the shift start date
 */
export function getShiftIsoWeekday(shift: IShift): number {
  return getShiftDayjsDate(shift, "start").isoWeekday();
}

/**
 * Duration of the shift in hours and minutes
 */
export function getShiftDuration(shift: IShift): {
  totalHours: number;
  totalMinutes: number;
} {
  if (shift.deleting) {
    // if the shift is being deleted, the duration is 0
    return { totalHours: 0, totalMinutes: 0 };
  }

  let totalMinutes = 0;

  if (shift.pendingUpdate?.start && shift.pendingUpdate?.end) {
    // If there are pending updates, use those dates
    totalMinutes = dayjs(shift.pendingUpdate.end, SHIFTFORMAT).diff(
      dayjs(shift.pendingUpdate.start, SHIFTFORMAT),
      "minute"
    );
  } else {
    totalMinutes = getShiftDayjsDate(shift, "end").diff(
      getShiftDayjsDate(shift, "start"),
      "minutes"
    );
  }
  const totalHours = totalMinutes / 60;
  return { totalHours, totalMinutes };
}

/**
 * Get the base wage for the shift based on the hourly wage and the duration of the shift
 */
export function getShiftBaseWage(shift: IShift): number {
  const hw = getShiftAttribute(shift, "hourlyWage");
  if (shift.deleting || !hw || typeof hw !== "number") {
    // if the shift is being deleted, the wage is 0
    return 0;
  }

  return hw * getShiftDuration(shift).totalHours;
}

/**
 * Get the base data of the shift independent of pending updates.
 * - User to show the actual data in the UI. (My Shifts)
 */
export function getShiftBaseData(shift: IShift) {
  return {
    start: dayjs(shift.start, SHIFTFORMAT),
    end: dayjs(shift.end, SHIFTFORMAT),
    position: shift.position,
    notes: shift.notes,
  };
}

/**
 * Get the position associated with the shift
 */
export function getShiftAttribute<T>(
  shift: IShift,
  attribute: keyof IPrimaryShiftData
): T | undefined {
  if (shift.pendingUpdate?.[attribute]) {
    return shift.pendingUpdate[attribute] as T;
  }
  return shift[attribute] as T | undefined;
}

/**
 * Get the position associated with the shift
 */
export function getShiftLatestData(shift: IShift): IShift {
  if (shift.pendingUpdate) {
    return {
      ...shift,
      ...shift.pendingUpdate,
    };
  }
  return shift;
}

/**
 * Calculate the shift wage data based on the overtime settings
 * @param {number} accumulatedHours - The accumulated hours from previous shifts in the week, set to 0 if you want to calculate the wage data for the current shift only or daily overtime
 * @param {number} hoursLimit - The overtime hours limit
 * @param {number} overtimeRateOfPay - The overtime rate of pay
 */
export function calculateShiftHourlyWage(
  shift: IShift,
  accumulatedHours: number,
  hoursLimit: number,
  overtimeRateOfPay: number
) {
  const totalShiftHours = getShiftDuration(shift).totalHours;
  const baseWage = getShiftBaseWage(shift);
  const hourlyWage = getShiftAttribute<number>(shift, "hourlyWage");
  // Calculate total accumulated hours
  const totalAccumulatedHours = accumulatedHours + totalShiftHours;

  if (totalAccumulatedHours <= hoursLimit) {
    // If total accumulated hours is less than or equal to the overtime hours limit, set default values and return
    return {
      normalHours: totalShiftHours,
      overtimeHours: 0,
      totalHours: totalShiftHours,
      normalWage: baseWage,
      overtimeWage: 0,
      totalWage: baseWage,
    };
  }

  // Calculate the total overtime hours
  let totalOvertimeHours = totalAccumulatedHours - hoursLimit;

  if (totalOvertimeHours < 0) {
    // If total overtime hours is less than 0, set it to 0
    totalOvertimeHours = 0;
  }

  let shiftOvertimeHours = 0;

  if (totalOvertimeHours >= totalShiftHours) {
    // If total overtime hours is greater than or equal to the total shift hours, set the shift overtime hours to the total shift hours
    shiftOvertimeHours = totalShiftHours;
  } else {
    // If total overtime hours is less than the total shift hours, set the shift overtime hours to the total overtime hours
    shiftOvertimeHours = totalOvertimeHours;
  }

  const shiftNormalHours = totalShiftHours - shiftOvertimeHours;

  if (!hourlyWage) {
    // If hourly wage is not set, set default values to 0 and return
    return {
      normalHours: shiftNormalHours,
      overtimeHours: shiftOvertimeHours,
      totalHours: totalShiftHours,
      normalWage: 0,
      overtimeWage: 0,
      totalWage: 0,
    };
  }

  // Set wage data
  return {
    normalHours: shiftNormalHours,
    overtimeHours: shiftOvertimeHours,
    totalHours: totalShiftHours,
    normalWage: baseWage,
    overtimeWage: shiftOvertimeHours * overtimeRateOfPay,
    totalWage: baseWage + shiftOvertimeHours * overtimeRateOfPay,
  };
}

/**
 * Check is the employee's schedule have any changes or is unpublished
 */
export function checkIfShiftsHaveChanges(shift: IShift): boolean {
  return Boolean(
    !isEmpty(shift.pendingUpdate) || shift.deleting || shift.status === "draft"
  );
}

export function calculateWageData(
  empShifts: WeekSchedule["shifts"][string],
  options?: WageOptions
): WageDataRecord {
  const result: WageDataRecord = {
    summary: {},
    shifts: new Map(),
  };

  if (!empShifts || isEmpty(empShifts)) {
    // if there is no shifts, return the default value
    console.log("No shifts");
    return result;
  }

  const shiftsArray = Object.values(empShifts);

  // Calculate the wage data for each shift
  shiftsArray.forEach((shift) => {
    let accumulatedHours = 0;
    if (options) {
      const { mode, hoursLimit, multiplier } = options;
      // if there is options, calculate the overtime
      const overtimeRateOfPay = getOvertimeRateOfPay(shiftsArray, multiplier);
      if (mode === "weekly") {
        // if the mode is weekly, calculate the accumulated hours
        accumulatedHours = shiftsArray.reduce(
          (acc, s) =>
            acc +
            (getShiftDayjsDate(s, "start").isBefore(
              getShiftDayjsDate(shift, "start")
            )
              ? getShiftDuration(s).totalHours
              : 0),
          0
        );
      } else {
        // if the mode is daily, calculate the accumulated hours
        accumulatedHours = shiftsArray.reduce(
          (acc, s) =>
            acc +
            (getShiftDayjsDate(s, "start").isSame(
              getShiftDayjsDate(shift, "start"),
              "day"
            ) &&
            getShiftDayjsDate(s, "start").isBefore(
              getShiftDayjsDate(shift, "start")
            )
              ? getShiftDuration(s).totalHours
              : 0),
          0
        );
      }
      const shiftWageData = calculateShiftHourlyWage(
        shift,
        accumulatedHours,
        hoursLimit,
        overtimeRateOfPay
      );

      result.shifts.set(shift.id, {
        wageData: shiftWageData,
        isoWeekDay: getShiftIsoWeekday(shift),
      });
    }
  });

  result.shifts.forEach((shiftData) => {
    const { wageData, isoWeekDay } = shiftData;
    const {
      normalHours,
      overtimeHours,
      totalHours,
      normalWage,
      overtimeWage,
      totalWage,
    } = wageData;
    if (result.summary[isoWeekDay]) {
      // If the weekday already exists in the accumulator, add the shift hours and wage to the existing values
      result.summary[isoWeekDay].normalHours += normalHours;
      result.summary[isoWeekDay].overtimeHours += overtimeHours;
      result.summary[isoWeekDay].totalHours += totalHours;
      result.summary[isoWeekDay].normalWage += normalWage;
      result.summary[isoWeekDay].overtimeWage += overtimeWage;
      result.summary[isoWeekDay].totalWage += totalWage;
      result.summary[isoWeekDay].totalShifts += 1;
    } else {
      // If the weekday does not exist in the accumulator, add it with the shift hours and wage
      result.summary[isoWeekDay] = {
        normalHours,
        overtimeHours,
        totalHours,
        normalWage,
        overtimeWage,
        totalWage,
        totalShifts: 1,
        people: 1,
      };
    }
  });

  return result;
}

export function calculateWageDataFromArray(
  empShifts: [string, IShift][],
  options?: WageOptions
): WageDataRecord {
  const result: WageDataRecord = {
    summary: {},
    shifts: new Map(),
  };

  if (!empShifts.length) {
    // if there is no shifts, return the default value
    console.log("No shifts");
    return result;
  }

  // Calculate the wage data for each shift
  empShifts.forEach(([, shift]) => {
    let accumulatedHours = 0;
    if (options) {
      const { mode, hoursLimit, multiplier } = options;
      // if there is options, calculate the overtime
      const overtimeRateOfPay = getOvertimeRateOfPay(
        empShifts.map(([, es]) => es),
        multiplier
      );
      if (mode === "weekly") {
        // if the mode is weekly, calculate the accumulated hours
        accumulatedHours = empShifts.reduce(
          (acc, [, s]) =>
            acc +
            (getShiftDayjsDate(s, "start").isBefore(
              getShiftDayjsDate(shift, "start")
            )
              ? getShiftDuration(s).totalHours
              : 0),
          0
        );
      } else {
        // if the mode is daily, calculate the accumulated hours
        accumulatedHours = empShifts.reduce(
          (acc, [, s]) =>
            acc +
            (getShiftDayjsDate(s, "start").isSame(
              getShiftDayjsDate(shift, "start"),
              "day"
            ) &&
            getShiftDayjsDate(s, "start").isBefore(
              getShiftDayjsDate(shift, "start")
            )
              ? getShiftDuration(s).totalHours
              : 0),
          0
        );
      }
      const shiftWageData = calculateShiftHourlyWage(
        shift,
        accumulatedHours,
        hoursLimit,
        overtimeRateOfPay
      );

      result.shifts.set(shift.id, {
        wageData: shiftWageData,
        isoWeekDay: getShiftIsoWeekday(shift),
      });
    }
  });

  result.shifts.forEach((shiftData) => {
    const { wageData, isoWeekDay } = shiftData;
    const {
      normalHours,
      overtimeHours,
      totalHours,
      normalWage,
      overtimeWage,
      totalWage,
    } = wageData;
    if (result.summary[isoWeekDay]) {
      // If the weekday already exists in the accumulator, add the shift hours and wage to the existing values
      result.summary[isoWeekDay].normalHours += normalHours;
      result.summary[isoWeekDay].overtimeHours += overtimeHours;
      result.summary[isoWeekDay].totalHours += totalHours;
      result.summary[isoWeekDay].normalWage += normalWage;
      result.summary[isoWeekDay].overtimeWage += overtimeWage;
      result.summary[isoWeekDay].totalWage += totalWage;
      result.summary[isoWeekDay].totalShifts += 1;
    } else {
      // If the weekday does not exist in the accumulator, add it with the shift hours and wage
      result.summary[isoWeekDay] = {
        normalHours,
        overtimeHours,
        totalHours,
        normalWage,
        overtimeWage,
        totalWage,
        totalShifts: 1,
        people: 1,
      };
    }
  });

  return result;
}
