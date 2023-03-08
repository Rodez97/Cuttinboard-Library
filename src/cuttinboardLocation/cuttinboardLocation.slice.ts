import { ILocation } from "@cuttinboard-solutions/types-helpers";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LoadingStatus } from "../models";

export interface CuttinboardLocationState extends LoadingStatus {
  data?: ILocation;
}

const locationSlice = createSlice({
  name: "cuttinboardLocation",
  initialState: {
    loading: "idle",
  } as CuttinboardLocationState,
  reducers: {
    upsertLocation(state, action: PayloadAction<ILocation>) {
      if (state.loading === "failed") {
        state.error = undefined;
      }
      state.loading = "succeeded";
      state.data = action.payload;
    },
    setLocationError(state, action: PayloadAction<string>) {
      state.loading = "failed";
      state.error = action.payload;
    },
    startLocationLoading(
      state,
      action: PayloadAction<LoadingStatus["loading"]>
    ) {
      state.loading = action.payload;
    },
  },
});

export const { upsertLocation, setLocationError, startLocationLoading } =
  locationSlice.actions;

export const cuttinboardLocationReducer = locationSlice.reducer;
