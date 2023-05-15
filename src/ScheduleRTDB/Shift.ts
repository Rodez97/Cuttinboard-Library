import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek.js";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { isEmpty } from "lodash";
import {
  DocumentData,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { getOvertimeRateOfPay } from "./ShiftData";
import {
  IEmployee,
  IPrimaryShiftData,
  IShift,
  SHIFTFORMAT,
  WageDataRecord,
  WageOptions,
} from "@cuttinboard-solutions/types-helpers";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

export const shiftConverter = {
  toFirestore(object: PartialWithFieldValue<IShift>): DocumentData {
    return { ...object, updatedAt: new Date().getTime() };
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IShift>,
    options: SnapshotOptions
  ): IShift {
    const { id } = value;
    const rawData = value.data(options);
    return {
      ...rawData,
      id,
    };
  },
};

export function generateOrderFactor(weekId: string) {
  const [week, year] = weekId.split("-").slice(1).map(Number);
  // Convert the week number to decimal (e.g. 0.01 for week 1, 0.10 for week 10, 0.52 for week 52)
  const weekDecimal = week / 100;
  // Add the year to the week decimal (e.g. 2020.01 for week 1 of 2020, 2020.10 for week 10 of 2020, 2020.52 for week 52 of 2020)
  const yearDecimal = year + weekDecimal;
  return yearDecimal;
}

export function swapShifts(
  from: { shift: IShift; employee: IEmployee },
  to: { shift: IShift; employee: IEmployee }
) {
  // Check that the employees have the required positions in case the shifts are assigned to a position
  if (
    from.shift.position &&
    !to.employee.positions?.includes(from.shift.position)
  ) {
    throw new Error(
      `Employee ${to.employee.name} does not have the required position ${from.shift.position}`
    );
  }
  if (
    to.shift.position &&
    !from.employee.positions?.includes(to.shift.position)
  ) {
    throw new Error(
      `Employee ${from.employee.name} does not have the required position ${to.shift.position}`
    );
  }
  // Get the hourly wage of each employee
  const fromHourlyWage = to.shift.position
    ? from.employee.wagePerPosition?.[to.shift.position] ?? 0
    : 0;
  const toHourlyWage = from.shift.position
    ? to.employee.wagePerPosition?.[from.shift.position] ?? 0
    : 0;

  const fromShift = {
    ...from.shift,
    employeeId: to.employee.id,
    hourlyWage: toHourlyWage,
    pendingUpdate: null,
  };

  const toShift = {
    ...to.shift,
    employeeId: from.employee.id,
    hourlyWage: fromHourlyWage,
    pendingUpdate: null,
  };

  return { fromShift, toShift };
}

export function ownOpenShift(shift: IShift, employee: IEmployee) {
  if (shift.employeeId !== "open") {
    throw new Error("You cannot own an already owned shift");
  }
  if (shift.position && !employee.positions?.includes(shift.position)) {
    throw new Error(
      `Employee ${employee.name} does not have the required position ${shift.position}`
    );
  }

  const hourlyWage = shift.position
    ? employee.wagePerPosition?.[shift.position] ?? 0
    : 0;

  return {
    ...shift,
    employeeId: employee.id,
    hourlyWage,
    pendingUpdate: null,
  };
}

export function getShiftDayjsDate(
  shift: IShift,
  date: "start" | "end",
  latest = true
): Dayjs {
  if (latest && shift.pendingUpdate?.[date]) {
    return dayjs(shift.pendingUpdate[date], SHIFTFORMAT);
  }

  return dayjs(shift[date], SHIFTFORMAT);
}

export function getShiftIsoWeekday(shift: IShift): number {
  return getShiftDayjsDate(shift, "start").isoWeekday();
}

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

export function getShiftBaseWage(shift: IShift): number {
  const hw = getShiftAttribute(shift, "hourlyWage");
  if (shift.deleting || !hw || typeof hw !== "number") {
    // if the shift is being deleted, the wage is 0
    return 0;
  }

  return hw * getShiftDuration(shift).totalHours;
}

export function getShiftBaseData(shift: IShift) {
  return {
    start: dayjs(shift.start, SHIFTFORMAT),
    end: dayjs(shift.end, SHIFTFORMAT),
    position: shift.position,
    notes: shift.notes,
  };
}

export function getShiftAttribute<T>(
  shift: IShift,
  attribute: keyof IPrimaryShiftData
): T | undefined {
  if (shift.pendingUpdate?.[attribute]) {
    return shift.pendingUpdate[attribute] as T;
  }
  return shift[attribute] as T | undefined;
}

export function getShiftLatestData(shift: IShift): IShift {
  if (shift.pendingUpdate) {
    return {
      ...shift,
      ...shift.pendingUpdate,
    };
  }
  return shift;
}

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

  if (hoursLimit === 0 || totalAccumulatedHours <= hoursLimit) {
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

export function checkIfShiftsHaveChanges(shift: IShift): boolean {
  return Boolean(
    !isEmpty(shift.pendingUpdate) || shift.deleting || shift.status === "draft"
  );
}

export function calculateWageData(
  empShifts: IShift[] | undefined,
  options?: WageOptions
): WageDataRecord {
  const result: WageDataRecord = {
    summary: {},
    shifts: new Map(),
  };

  if (!empShifts || !empShifts.length) {
    // if there is no shifts, return the default value
    return result;
  }

  // Calculate the wage data for each shift
  empShifts.forEach((shift) => {
    let accumulatedHours = 0;
    if (options) {
      const { mode, hoursLimit, multiplier } = options;
      // if there is options, calculate the overtime
      let overtimeRateOfPay = 0;

      if (mode === "weekly") {
        overtimeRateOfPay = getOvertimeRateOfPay(empShifts, multiplier);
        // if the mode is weekly, calculate the accumulated hours
        accumulatedHours = empShifts.reduce(
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
        const todayShifts = empShifts.filter((s) =>
          getShiftDayjsDate(s, "start").isSame(
            getShiftDayjsDate(shift, "start"),
            "day"
          )
        );
        overtimeRateOfPay = getOvertimeRateOfPay(todayShifts, multiplier);
        // if the mode is daily, calculate the accumulated hours
        accumulatedHours = empShifts.reduce(
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
    } else {
      const shiftWageData = calculateShiftHourlyWage(
        shift,
        accumulatedHours,
        0,
        0
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
  empShifts: IShift[] | undefined,
  options?: WageOptions
): WageDataRecord {
  const result: WageDataRecord = {
    summary: {},
    shifts: new Map(),
  };

  if (!empShifts || !empShifts.length) {
    // if there is no shifts, return the default value
    return result;
  }

  // Calculate the wage data for each shift
  empShifts.forEach((shift) => {
    let accumulatedHours = 0;
    if (options) {
      const { mode, hoursLimit, multiplier } = options;
      // if there is options, calculate the overtime
      const overtimeRateOfPay = getOvertimeRateOfPay(
        empShifts.map((es) => es),
        multiplier
      );
      if (mode === "weekly") {
        // if the mode is weekly, calculate the accumulated hours
        accumulatedHours = empShifts.reduce(
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
        accumulatedHours = empShifts.reduce(
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
