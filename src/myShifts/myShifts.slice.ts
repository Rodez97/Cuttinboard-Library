import {
  createSlice,
  Reducer,
  createEntityAdapter,
  EntityState,
  PayloadAction,
  createSelector,
} from "@reduxjs/toolkit";
import { RootState } from "../reduxStore/utils";
import { LoadingStatus } from "../models/LoadingStatus";
import { groupBy, upperFirst } from "lodash";
import {
  getShiftBaseData,
  getShiftDayjsDate,
  IShift,
} from "@cuttinboard-solutions/types-helpers";

const myShiftsAdapter = createEntityAdapter<IShift>({
  sortComparer: (a, b) => {
    const aDate = getShiftDayjsDate(a, "start").toDate();
    const bDate = getShiftDayjsDate(b, "start").toDate();
    return aDate > bDate ? 1 : -1;
  },
});

const myShiftsSlice = createSlice({
  name: "myShifts",
  initialState: myShiftsAdapter.getInitialState<LoadingStatus>({
    loading: "idle",
    error: undefined,
  }),
  reducers: {
    setMyShifts: (state, action: PayloadAction<IShift[]>) => {
      // Update the loading state as appropriate
      if (state.loading === "failed") {
        state.error = undefined;
      }
      state.loading = "succeeded";
      myShiftsAdapter.setAll(state, action.payload);
    },
    changeMyShiftsLoading: (state, action: PayloadAction<LoadingStatus>) => {
      state.loading = action.payload.loading;
    },
    setMyShiftsError: (state, action: PayloadAction<string>) => {
      state.loading = "failed";
      state.error = action.payload;
    },
  },
});

export const { setMyShifts, changeMyShiftsLoading, setMyShiftsError } =
  myShiftsSlice.actions;

type MyShiftsActions =
  | ReturnType<typeof setMyShifts>
  | ReturnType<typeof setMyShiftsError>
  | ReturnType<typeof changeMyShiftsLoading>;

export const myShiftsReducer: Reducer<
  EntityState<IShift> & LoadingStatus,
  MyShiftsActions
> = myShiftsSlice.reducer;

export const myShiftsSelectors = myShiftsAdapter.getSelectors<RootState>(
  (state) => state.myShifts
);

export const selectMyShiftsLoading = (state: RootState) =>
  state.myShifts.loading === "pending" || state.myShifts.loading === "idle";

export const selectMyShiftsError = (state: RootState) => state.myShifts.error;

export const selectMyShifts = (state: RootState) =>
  myShiftsSelectors.selectAll(state);

export const selectMyShiftsGroupedByDay = createSelector(
  myShiftsSelectors.selectAll,
  (myShifts) => {
    const grouped = groupBy(myShifts, (shf) =>
      upperFirst(getShiftBaseData(shf).start.format("dddd, MMMM DD, YYYY"))
    );
    return Object.entries(grouped);
  }
);
