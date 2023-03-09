import {
  getEmployeeShiftsWageData,
  getUpdatesCountFromArray,
  getWeekSummary,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import { createSelector } from "@reduxjs/toolkit";
import { selectLocationScheduleSettings } from "../cuttinboardLocation";
import { employeesSelectors } from "../employee";
import { RootState } from "../reduxStore/utils";
import { scheduleSelectors, shiftSelectors } from "./schedule.slice";

export const makeShiftsSelector = (weekId: string) =>
  createSelector(
    (state: RootState) => scheduleSelectors.selectById(state, weekId),
    (selectedWeek) =>
      selectedWeek ? shiftSelectors.selectAll(selectedWeek.shifts) : []
  );

export const makeScheduleSummarySelector = (weekId: string) =>
  createSelector(
    (state: RootState) => scheduleSelectors.selectById(state, weekId),
    (schedule) => schedule?.summary
  );

export const makeEmpShiftsSelector = (weekId: string) =>
  createSelector(
    employeesSelectors.selectAll,
    makeShiftsSelector(weekId),
    (employees, shifts) =>
      employees
        .filter((e) => e.role !== RoleAccessLevels.ADMIN)
        .map((emp) => ({
          employee: emp,
          shifts: shifts.filter((s) => s.employeeId === emp.id),
          key: emp.id,
        }))
  );

export const makeSingleEmpShiftsSelector = (weekId: string) =>
  createSelector(
    makeShiftsSelector(weekId),
    employeesSelectors.selectAll,
    (shifts, employees) =>
      shifts.filter((shift) => employees.some((e) => e.id === shift.employeeId))
  );

export const selectScheduleLoading = (state: RootState) =>
  state.schedule.loading === "pending" || state.schedule.loading === "idle";

export const selectScheduleLoadingStatus = (state: RootState) =>
  state.schedule?.loading;

export const selectScheduleError = (state: RootState) => state.schedule.error;

export const makeSelectUpdatesCount = (weekId: string) =>
  createSelector(makeSingleEmpShiftsSelector(weekId), getUpdatesCountFromArray);

export const makeSelectWageData = (weekId: string) =>
  createSelector(
    makeSingleEmpShiftsSelector(weekId),
    selectLocationScheduleSettings,
    getEmployeeShiftsWageData
  );

export const makeSelectWeekSummary = (weekId: string) =>
  createSelector(
    makeSelectWageData(weekId),
    makeScheduleSummarySelector(weekId),
    getWeekSummary
  );
