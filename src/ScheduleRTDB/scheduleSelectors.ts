import {
  IEmployee,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import {
  getEmployeeShiftsWageDataFromArray,
  getUpdatesCountFromArray,
  getWeekSummary,
  IShift,
  WeekSchedule,
} from "@cuttinboard-solutions/types-helpers/dist/ScheduleRTDB";
import { createSelector } from "@reduxjs/toolkit";
import { selectLocationScheduleSettings } from "../cuttinboardLocation";
import { employeesSelectors } from "../employee";
import { RootState } from "../reduxStore/utils";
import { scheduleAdapter } from "./schedule.slice";

export const scheduleSelectors = scheduleAdapter.getSelectors<RootState>(
  (state) => state.schedule
);

export const makeSelectScheduleDocument = (weekId: string) =>
  createSelector(
    (state: RootState) => scheduleSelectors.selectById(state, weekId),
    (schedule) => schedule?.schedule
  );

export const makeSelectScheduleSummary = (weekId: string) =>
  createSelector(
    makeSelectScheduleDocument(weekId),
    (schedule) => schedule?.summary
  );

export const makeEmpShiftsSelector = (weekId: string) =>
  createSelector(
    makeSelectScheduleDocument(weekId),
    employeesSelectors.selectAll,
    (schedule, employees) =>
      schedule ? normalizeEmployeeShifts(schedule.shifts, employees) : []
  );

export const selectScheduleLoading = (state: RootState) =>
  state.schedule.loading === "pending" || state.schedule.loading === "idle";

export const selectScheduleLoadingStatus = (state: RootState) =>
  state.schedule?.loading;

export const selectScheduleError = (state: RootState) => state.schedule.error;

export const makeSelectUpdatesCount = (weekId: string) =>
  createSelector(makeEmpShiftsSelector(weekId), (shifts) =>
    getUpdatesCountFromArray(shifts)
  );

export const makeSelectWageData = (weekId: string) =>
  createSelector(
    makeEmpShiftsSelector(weekId),
    selectLocationScheduleSettings,
    (employeeShifts, scheduleSettings) =>
      getEmployeeShiftsWageDataFromArray(employeeShifts, scheduleSettings)
  );

export const makeSelectWeekSummary = (weekId: string) =>
  createSelector(
    makeSelectWageData(weekId),
    makeSelectScheduleSummary(weekId),
    (wageData, summary) => getWeekSummary(wageData, summary)
  );

export const normalizeEmployeeShifts = (
  employeeShifts: WeekSchedule["shifts"],
  employees: IEmployee[]
): [string, [string, IShift][]][] => {
  const locEmployees = employees.filter(
    (e) => e.role !== RoleAccessLevels.ADMIN
  );
  const shiftsArray = employeeShifts
    ? Object.entries(employeeShifts).filter((es) =>
        locEmployees.some((e) => e.id === es[0])
      )
    : [];
  // If there are no shifts, return
  if (shiftsArray.length === 0) {
    return [];
  }

  const flatShiftsArray: [string, [string, IShift][]][] = shiftsArray.map(
    ([employeeId, shifts]) => [employeeId, Object.entries(shifts)]
  );

  return flatShiftsArray;
};
