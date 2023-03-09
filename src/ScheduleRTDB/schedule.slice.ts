import { IShift, IScheduleDoc } from "@cuttinboard-solutions/types-helpers";
import {
  createEntityAdapter,
  createSlice,
  EntityState,
  PayloadAction,
} from "@reduxjs/toolkit";
import { keyBy } from "lodash";
import { LoadingStatus } from "../models";
import { RootState } from "../reduxStore";

export interface ScheduleState extends LoadingStatus {
  selectedWeekId?: undefined | string;
}

// Interfaces
export interface ScheduleEntry {
  id: string;
  summary: IScheduleDoc;
  shifts: EntityState<IShift>;
}

export const shiftsAdapter = createEntityAdapter<IShift>();
export const scheduleAdapter = createEntityAdapter<ScheduleEntry>();

export const scheduleSelectors = scheduleAdapter.getSelectors<RootState>(
  (state) => state.schedule
);

export const shiftSelectors = shiftsAdapter.getSelectors();

// Slice
const scheduleSlice = createSlice({
  name: "schedule",
  initialState: scheduleAdapter.getInitialState<ScheduleState>({
    loading: "idle",
  }),
  reducers: {
    setScheduleData(
      state,
      action: PayloadAction<{
        weekId: string;
        shifts: IShift[];
        summary: IScheduleDoc;
      }>
    ) {
      const { weekId, shifts, summary } = action.payload;
      const scheduleEntry = state.entities[weekId];
      if (!scheduleEntry) {
        scheduleAdapter.addOne(state, {
          id: weekId,
          summary,
          shifts: shiftsAdapter.getInitialState({
            ids: shifts.map((s) => s.id),
            entities: keyBy(shifts, (s) => s.id),
          }),
        });
      } else {
        scheduleEntry.summary = summary;
        shiftsAdapter.setAll(scheduleEntry.shifts, shifts);
      }
      if (state.loading === "failed") {
        state.error = undefined;
      }
      state.loading = "succeeded";
    },
    setShifts(
      state,
      action: PayloadAction<{
        weekId: string;
        shifts: IShift[];
      }>
    ) {
      const { weekId, shifts } = action.payload;
      const scheduleEntry = state.entities[weekId];
      if (!scheduleEntry) {
        return;
      }
      shiftsAdapter.setAll(scheduleEntry.shifts, shifts);
    },
    upsertShifts(
      state,
      action: PayloadAction<{
        weekId: string;
        shifts: IShift[];
      }>
    ) {
      const { weekId, shifts } = action.payload;
      const scheduleEntry = state.entities[weekId];
      if (!scheduleEntry) {
        return;
      }
      shiftsAdapter.upsertMany(scheduleEntry.shifts, shifts);
    },
    upsertEmployeeShifts(
      state,
      action: PayloadAction<{
        weekId: string;
        employeeId: string;
        newEntry: IShift[];
      }>
    ) {
      // Replace the employee's shifts with the new shifts
      const { weekId, employeeId, newEntry } = action.payload;
      const scheduleEntry = state.entities[weekId];
      if (!scheduleEntry) {
        return;
      }
      const empShiftsEntry = shiftSelectors
        .selectAll(scheduleEntry.shifts)
        .filter((s) => s.employeeId === employeeId);

      // Deleted shifts
      const deletedShifts = empShiftsEntry.filter(
        (s) => !newEntry.some((ns) => ns.id === s.id)
      );
      shiftsAdapter.removeMany(
        scheduleEntry.shifts,
        deletedShifts.map((s) => s.id)
      );
      // Updated shifts
      const updatedShifts = empShiftsEntry.filter((s) =>
        newEntry.some((ns) => ns.id === s.id)
      );
      shiftsAdapter.upsertMany(scheduleEntry.shifts, updatedShifts);
      // New shifts
      const newShifts = newEntry.filter(
        (s) => !empShiftsEntry.some((es) => es.id === s.id)
      );
      shiftsAdapter.upsertMany(scheduleEntry.shifts, newShifts);
    },
    setScheduleDocument(
      state,
      action: PayloadAction<{
        weekId: string;
        summary: IScheduleDoc;
      }>
    ) {
      const { weekId, summary } = action.payload;
      const scheduleEntry = state.entities[weekId];
      if (!scheduleEntry) {
        return;
      }
      scheduleEntry.summary = summary;
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
  setScheduleData,
  setScheduleDocument,
  setShifts,
  setEmployeeShiftsLoading,
  setEmployeeShiftsError,
  upsertEmployeeShifts,
  upsertShifts,
} = scheduleSlice.actions;

export const scheduleReducer = scheduleSlice.reducer;
