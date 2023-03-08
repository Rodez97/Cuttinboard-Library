import { WeekSchedule } from "@cuttinboard-solutions/types-helpers";
import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { LoadingStatus } from "../models";

// Interfaces
export interface ScheduleEntry {
  id: string;
  schedule: WeekSchedule;
}

export interface ScheduleState extends LoadingStatus {
  selectedWeekId?: undefined | string;
}

export const scheduleAdapter = createEntityAdapter<ScheduleEntry>();

// Slice
const scheduleSlice = createSlice({
  name: "schedule",
  initialState: scheduleAdapter.getInitialState<ScheduleState>({
    loading: "idle",
  }),
  reducers: {
    setEmployeeShifts(
      state,
      action: PayloadAction<{
        weekId: string;
        schedule: WeekSchedule;
      }>
    ) {
      const { weekId, schedule } = action.payload;
      if (state.loading === "failed") {
        state.error = undefined;
      }
      state.loading = "succeeded";
      const scheduleEntry = state.entities[weekId];
      if (!scheduleEntry) {
        scheduleAdapter.addOne(state, {
          id: weekId,
          schedule,
        });
      } else {
        scheduleEntry.schedule = schedule;
      }
    },
    setEmployeeShiftsDocuments(
      state,
      action: PayloadAction<{
        weekId: string;
        shifts: WeekSchedule["shifts"];
      }>
    ) {
      const { weekId, shifts } = action.payload;
      const scheduleEntry = state.entities[weekId];
      if (!scheduleEntry) {
        return;
      }
      scheduleEntry.schedule.shifts = shifts;
    },
    upsertEmployeeShiftsEntry(
      state,
      action: PayloadAction<{
        weekId: string;
        employeeId: string;
        entry: WeekSchedule["shifts"][string];
      }>
    ) {
      const { weekId, employeeId, entry } = action.payload;
      const scheduleEntry = state.entities[weekId];
      if (!scheduleEntry) {
        return;
      }
      scheduleEntry.schedule.shifts = {
        ...scheduleEntry.schedule.shifts,
        [employeeId]: entry,
      };
    },
    upsertEmployeeShifts(
      state,
      action: PayloadAction<{
        weekId: string;
        empShifts: WeekSchedule["shifts"];
      }>
    ) {
      const { weekId, empShifts } = action.payload;
      const scheduleEntry = state.entities[weekId];
      if (!scheduleEntry) {
        return;
      }
      scheduleEntry.schedule.shifts = empShifts;
    },
    setScheduleDocument(
      state,
      action: PayloadAction<{
        weekId: string;
        summary: WeekSchedule["summary"];
      }>
    ) {
      const { weekId, summary } = action.payload;
      const scheduleEntry = state.entities[weekId];
      if (!scheduleEntry) {
        return;
      }
      scheduleEntry.schedule.summary = summary;
    },
    setEmployeeShiftsLoading(
      state,
      action: PayloadAction<LoadingStatus["loading"]>
    ) {
      state.loading = action.payload;
    },
    setEmployeeShiftsError(state, action: PayloadAction<string>) {
      state.loading = "failed";
      state.error = action.payload;
    },
  },
});

export const {
  setEmployeeShifts,
  setScheduleDocument,
  setEmployeeShiftsDocuments,
  setEmployeeShiftsLoading,
  setEmployeeShiftsError,
  upsertEmployeeShiftsEntry,
  upsertEmployeeShifts,
} = scheduleSlice.actions;

export const scheduleReducer = scheduleSlice.reducer;
