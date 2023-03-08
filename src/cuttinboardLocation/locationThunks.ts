import {
  arrayRemove,
  arrayUnion,
  doc,
  PartialWithFieldValue,
  setDoc,
} from "firebase/firestore";
import { FIRESTORE } from "../utils";
import { merge, set } from "lodash";
import { AppThunk } from "../reduxStore";
import { selectLocation } from "./locationSelectors";
import { upsertLocation } from "./cuttinboardLocation.slice";
import {
  ILocation,
  IScheduleSettings,
} from "@cuttinboard-solutions/types-helpers";

// Thunk Actions

export const addPositionThunk =
  (position: string): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState();
    const location = selectLocation(state);
    if (!location) {
      throw new Error("Location not found");
    }
    const docRef = doc(FIRESTORE, location.refPath);
    const serverUpdates: PartialWithFieldValue<ILocation> = {
      settings: { positions: arrayUnion(position) },
    };

    const localUpdates = location;
    set(
      localUpdates,
      "settings.positions",
      localUpdates.settings?.positions
        ? [...localUpdates.settings.positions, position]
        : [position]
    );

    dispatch(upsertLocation(localUpdates));
    try {
      await setDoc(docRef, serverUpdates, { merge: true });
    } catch (error) {
      dispatch(upsertLocation(location));
      throw error;
    }
  };

export const removePositionThunk =
  (position: string): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState();
    const location = selectLocation(state);
    if (!location) {
      throw new Error("Location not found");
    }
    const docRef = doc(FIRESTORE, location.refPath);
    const serverUpdates: PartialWithFieldValue<ILocation> = {
      settings: { positions: arrayRemove(position) },
    };

    const localUpdates = location;
    set(
      localUpdates,
      "settings.positions",
      localUpdates.settings?.positions
        ? localUpdates.settings.positions.filter((p) => p !== position)
        : []
    );

    dispatch(upsertLocation(localUpdates));
    try {
      await setDoc(docRef, serverUpdates, { merge: true });
    } catch (error) {
      dispatch(upsertLocation(location));
      throw error;
    }
  };

export const updateLocationThunk =
  (
    location: ILocation,
    newData: Partial<Omit<ILocation, "id">>
  ): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const docRef = doc(FIRESTORE, location.refPath);

    const localUpdates = location;
    merge(localUpdates, newData);

    dispatch(upsertLocation(localUpdates));
    try {
      await setDoc(docRef, newData, { merge: true });
    } catch (error) {
      dispatch(upsertLocation(location));
      throw error;
    }
  };

export const updateScheduleSettingsThunk =
  (newData: Partial<IScheduleSettings>): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState();
    const location = selectLocation(state);
    if (!location) {
      throw new Error("Location not found");
    }
    const docRef = doc(FIRESTORE, location.refPath);

    const localUpdates = location;
    merge(localUpdates, { settings: { schedule: newData } });

    dispatch(upsertLocation(localUpdates));
    try {
      await setDoc(
        docRef,
        { settings: { schedule: newData } },
        { merge: true }
      );
    } catch (error) {
      dispatch(upsertLocation(location));
      throw error;
    }
  };
