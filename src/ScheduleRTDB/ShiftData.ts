import {
  getShiftBaseWage,
  getShiftDayjsDate,
  getShiftDuration,
  getShiftLatestData,
} from "./Shift";
import { isEmpty } from "lodash";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek.js";
import duration from "dayjs/plugin/duration.js";
import { areIntervalsOverlapping } from "date-fns";
import {
  IScheduleSettings,
  IShift,
  WageDataByDay,
  WageOptions,
} from "@cuttinboard-solutions/types-helpers";
dayjs.extend(isoWeek);
dayjs.extend(duration);

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
  weekEmployeeShifts: IShift[] | undefined
): boolean {
  if (!weekEmployeeShifts || weekEmployeeShifts.length === 0) {
    return false;
  }
  return weekEmployeeShifts.some((shift) =>
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
export function checkShiftArrayChanges(shifts: IShift[]): boolean {
  return shifts.some((shift) =>
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
  weekEmployeeShifts: IShift[] | undefined,
  start: dayjs.Dayjs,
  end: dayjs.Dayjs,
  shiftId: string
): boolean {
  // Check if there are any shifts
  if (!weekEmployeeShifts || !weekEmployeeShifts.length) {
    return false;
  }

  // Check if the new shift start or end time overlaps with an existing shift
  return weekEmployeeShifts.some((shiftRaw) => {
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
  shifts: IShift[],
  start: dayjs.Dayjs,
  end: dayjs.Dayjs,
  shiftId: string
): boolean {
  // Check if there are any shifts
  if (!shifts.length) {
    return false;
  }

  // Check if the new shift start or end time overlaps with an existing shift
  return shifts.some((shiftRaw) => {
    // Check if the shift is the same shift
    if (shiftId === shiftRaw.id) {
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
  data: WageDataByDay | undefined | null
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

  if (!data) {
    return result;
  }

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
