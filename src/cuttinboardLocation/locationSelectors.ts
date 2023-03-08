import { DefaultScheduleSettings } from "@cuttinboard-solutions/types-helpers";
import { RootState } from "../reduxStore";

// Selectors

export const selectLocation = (state: RootState) =>
  state.cuttinboardLocation?.data;

export const selectLocationScheduleSettings = (state: RootState) =>
  state.cuttinboardLocation.data?.settings?.schedule ?? DefaultScheduleSettings;

export const selectLocationError = (state: RootState) =>
  state.cuttinboardLocation?.error;

export const selectLocationLoading = (state: RootState) =>
  state.cuttinboardLocation?.loading === "pending" ||
  state.cuttinboardLocation?.loading === "idle";
