import {
  getEmployeeShiftsWageData,
  getUpdatesCountFromArray,
  IEmployee,
  IScheduleSettings,
  IShift,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import { ILocalShift } from "./CustomTypes";

/**
 * This function calculates the number of updates needed for a list of shifts assigned to individual
 * employees.
 * @param {IEmployee[]} employees - an array of objects representing employees, where each object has
 * properties such as name, id, and position.
 * @param {IShift[]} shifts - An array of objects representing shifts. Each object should have
 * properties such as start time, end time, and employee ID to indicate which employee worked the
 * shift.
 * @returns The function `getUpdatesCount` is returning the result of calling the function
 * `getUpdatesCountFromArray` with the argument `singleEmpShifts`. The value returned by
 * `getUpdatesCountFromArray` will be the final return value of `getUpdatesCount`.
 */
export const getUpdatesCount = (shifts: ILocalShift[]) => {
  return getUpdatesCountFromArray(shifts);
};

/**
 * This function calculates wage data for employees based on their shifts and schedule settings.
 * @param {IEmployee[]} employees - An array of objects representing employees. Each object should have
 * properties such as name, id, hourly wage, etc.
 * @param {IShift[]} shifts - An array of objects representing shifts worked by employees. Each object
 * contains information such as the employee ID, start and end times of the shift, and the date of the
 * shift.
 * @param {IScheduleSettings} scheduleSettings - IScheduleSettings is likely an interface or type that
 * defines various settings related to employee scheduling, such as the number of hours in a workday,
 * the number of days in a workweek, overtime rules, and pay rates. This information is likely used to
 * calculate the wages for each employee based on their
 * @returns The function `getWageData` is returning the result of calling the function
 * `getEmployeeShiftsWageData` with the arguments `singleEmpShifts` and `scheduleSettings`. The
 * `singleEmpShifts` variable is the result of calling the function `getSingleEmpShifts` with the
 * arguments `employees` and `shifts`.
 */
export const getWageData = (
  employees: IEmployee[],
  shifts: ILocalShift[],
  scheduleSettings: IScheduleSettings
) => {
  const singleEmpShifts = getSingleEmpShifts(employees, shifts);
  return getEmployeeShiftsWageData(singleEmpShifts, scheduleSettings);
};
