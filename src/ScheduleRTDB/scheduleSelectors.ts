import {
  IEmployee,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import { IShift } from "./Shift";
import {
  getEmployeeShiftsWageData,
  getUpdatesCountFromArray,
} from "./scheduleMathHelpers";
import { IScheduleSettings } from "./ScheduleSettings";

export const getEmployeeShifts = (employees: IEmployee[], shifts: IShift[]) =>
  employees
    .filter((e) => e.role !== RoleAccessLevels.ADMIN)
    .map((emp) => ({
      employee: emp,
      shifts: shifts.filter((s) => s.employeeId === emp.id),
      key: emp.id,
    }));

export const getSingleEmpShifts = (employees: IEmployee[], shifts: IShift[]) =>
  shifts.filter((shift) => employees.some((e) => e.id === shift.employeeId));

export const getUpdatesCount = (employees: IEmployee[], shifts: IShift[]) => {
  const singleEmpShifts = getSingleEmpShifts(employees, shifts);
  return getUpdatesCountFromArray(singleEmpShifts);
};

export const getWageData = (
  employees: IEmployee[],
  shifts: IShift[],
  scheduleSettings: IScheduleSettings
) => {
  const singleEmpShifts = getSingleEmpShifts(employees, shifts);
  return getEmployeeShiftsWageData(singleEmpShifts, scheduleSettings);
};
