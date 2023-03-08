import {
  createSlice,
  Reducer,
  createEntityAdapter,
  EntityState,
  PayloadAction,
} from "@reduxjs/toolkit";
import { deleteDoc, doc, setDoc, Timestamp } from "firebase/firestore";
import { AppThunk, RootState } from "../reduxStore/utils";
import { getNewUtensilChangeUpdates, utensilConverter } from ".";
import { FIRESTORE } from "../utils";
import { LoadingStatus } from "../models/LoadingStatus";
import { IUtensil } from "@cuttinboard-solutions/types-helpers";

const utensilsAdapter = createEntityAdapter<IUtensil>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export const createUtensilThunk =
  (utensil: Omit<IUtensil, "percent">): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const percent = Math.floor(
      (utensil.currentQuantity / utensil.optimalQuantity) * 100
    );
    const docRef = doc(FIRESTORE, utensil.refPath).withConverter(
      utensilConverter
    );
    const newUtensil: IUtensil = { ...utensil, percent };
    dispatch(addUtensil(newUtensil));
    try {
      await setDoc(docRef, newUtensil);
    } catch (error) {
      dispatch(deleteUtensil(newUtensil.id));
      throw error;
    }
  };

export const addUtensilChangeThunk =
  (
    utensil: IUtensil,
    quantity: number,
    reason?: string
  ): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const docRef = doc(FIRESTORE, utensil.refPath).withConverter(
      utensilConverter
    );
    const { localUpdates, serverUpdates } = getNewUtensilChangeUpdates(
      utensil,
      quantity,
      reason
    );
    dispatch(upsertUtensil(localUpdates));
    try {
      await setDoc(docRef, serverUpdates, { merge: true });
    } catch (error) {
      dispatch(upsertUtensil(utensil));
      throw error;
    }
  };

export const updateUtensilThunk =
  (utensil: IUtensil, updates: Partial<IUtensil>): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const docRef = doc(FIRESTORE, utensil.refPath).withConverter(
      utensilConverter
    );
    const updatedAt = Timestamp.now().toMillis();
    const localUpdate = { ...utensil, ...updates, updatedAt };
    const newPercent = Math.floor(
      (localUpdate.currentQuantity / localUpdate.optimalQuantity) * 100
    );
    localUpdate.percent = newPercent;
    dispatch(upsertUtensil(localUpdate));
    try {
      await setDoc(
        docRef,
        {
          ...updates,
          percent: newPercent,
          updatedAt,
        },
        { merge: true }
      );
    } catch (error) {
      dispatch(upsertUtensil(utensil));
      throw error;
    }
  };

export const deleteUtensilThunk =
  (utensil: IUtensil): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const docRef = doc(FIRESTORE, utensil.refPath).withConverter(
      utensilConverter
    );
    dispatch(deleteUtensil(utensil.id));
    try {
      await deleteDoc(docRef);
    } catch (error) {
      dispatch(addUtensil(utensil));
      throw error;
    }
  };

const utensilsSlice = createSlice({
  name: "utensils",
  initialState: utensilsAdapter.getInitialState<LoadingStatus>({
    loading: "idle",
  }),
  reducers: {
    addUtensil: utensilsAdapter.addOne,
    setUtensils: (state, action) => {
      if (state.loading === "failed" || state.error) {
        state.error = undefined;
      }
      state.loading = "succeeded";
      utensilsAdapter.setAll(state, action.payload);
    },
    deleteUtensil: utensilsAdapter.removeOne,
    upsertUtensil: utensilsAdapter.upsertOne,
    updateUtensil: utensilsAdapter.updateOne,
    setUtensilsLoading(state, action: PayloadAction<LoadingStatus["loading"]>) {
      state.loading = action.payload;
    },
    setUtensilsError(state, action: PayloadAction<string>) {
      state.loading = "failed";
      state.error = action.payload;
    },
  },
});

export const {
  addUtensil,
  setUtensils,
  deleteUtensil,
  upsertUtensil,
  updateUtensil,
  setUtensilsLoading,
  setUtensilsError,
} = utensilsSlice.actions;

type UtensilsActions =
  | ReturnType<typeof addUtensil>
  | ReturnType<typeof setUtensils>
  | ReturnType<typeof deleteUtensil>
  | ReturnType<typeof upsertUtensil>
  | ReturnType<typeof updateUtensil>
  | ReturnType<typeof setUtensilsLoading>
  | ReturnType<typeof setUtensilsError>;

type UtensilsState = EntityState<IUtensil> & LoadingStatus;

export const utensilsReducer: Reducer<UtensilsState, UtensilsActions> =
  utensilsSlice.reducer;

export const utensilsSelectors = utensilsAdapter.getSelectors<RootState>(
  (state) => state.utensils
);

export const selectUtensilsLoading = (state: RootState) =>
  state.utensils.loading === "idle" || state.utensils.loading === "pending";

export const selectUtensilsLoadingStatus = (state: RootState) =>
  state.utensils.loading;

export const selectUtensilsError = (state: RootState) => state.utensils.error;
