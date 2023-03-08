import React, { createContext, ReactNode, useCallback, useMemo } from "react";
import { useLocationData } from "./useLocationData";
import { useAppSelector, useAppThunkDispatch } from "../reduxStore/utils";
import {
  selectLocation,
  selectLocationError,
  selectLocationLoading,
} from "./locationSelectors";
import {
  addPositionThunk,
  removePositionThunk,
  updateLocationThunk,
  updateScheduleSettingsThunk,
} from "./locationThunks";
import { useCuttinboard } from "../cuttinboard";
import {
  ILocation,
  IScheduleSettings,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";

export interface ILocationContext {
  positions: string[];
  role: RoleAccessLevels;
  location?: ILocation;
  loading: boolean;
  error?: string | undefined;
  addPosition: (position: string) => void;
  removePosition: (position: string) => void;
  updateLocation: (newData: Partial<ILocation>) => void;
  updateScheduleSettings: (newData: Partial<IScheduleSettings>) => void;
}

export const LocationContext = createContext<ILocationContext>(
  {} as ILocationContext
);

/**
 * Props del Provider principal de la App
 */
export interface ILocationProvider {
  children: ReactNode | ((context: ILocationContext) => JSX.Element);
}

export const LocationProvider = ({ children }: ILocationProvider) => {
  const { onError, organizationKey } = useCuttinboard();
  if (!organizationKey) {
    throw new Error("No organization selected");
  }
  const thunkDispatch = useAppThunkDispatch();
  const locationDocument = useAppSelector(selectLocation);
  const loading = useAppSelector(selectLocationLoading);
  const error = useAppSelector(selectLocationError);

  useLocationData(organizationKey);

  const addPosition = useCallback(
    (position: string) => {
      if (!locationDocument) {
        return;
      }
      thunkDispatch(addPositionThunk(position)).catch(onError);
    },
    [thunkDispatch, locationDocument]
  );

  const removePosition = useCallback(
    (position: string) => {
      if (!locationDocument) {
        return;
      }
      thunkDispatch(removePositionThunk(position)).catch(onError);
    },
    [thunkDispatch, locationDocument]
  );

  const updateLocation = useCallback(
    (newData: Partial<ILocation>) => {
      if (!locationDocument) {
        return;
      }
      thunkDispatch(updateLocationThunk(locationDocument, newData)).catch(
        onError
      );
    },
    [thunkDispatch, locationDocument]
  );

  const updateScheduleSettings = useCallback(
    (newData: Partial<IScheduleSettings>) => {
      if (!locationDocument) {
        return;
      }
      thunkDispatch(updateScheduleSettingsThunk(newData)).catch(onError);
    },
    [thunkDispatch, locationDocument]
  );

  const memoizedValue = useMemo(() => {
    const { role, pos } = organizationKey;
    return {
      location: locationDocument,
      positions: pos || [],
      role: role,
      loading,
      error,
      addPosition,
      removePosition,
      updateLocation,
      updateScheduleSettings,
    };
  }, [
    locationDocument,
    organizationKey,
    loading,
    error,
    addPosition,
    removePosition,
    updateLocation,
    updateScheduleSettings,
  ]);

  return (
    <LocationContext.Provider value={memoizedValue}>
      {typeof children === "function" ? children(memoizedValue) : children}
    </LocationContext.Provider>
  );
};
