import React, { createContext, ReactNode, useCallback, useMemo } from "react";
import { useLocationData } from "./useLocationData";
import {
  DefaultScheduleSettings,
  IEmployee,
  ILocation,
  IScheduleSettings,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import {
  arrayRemove,
  arrayUnion,
  doc,
  PartialWithFieldValue,
  setDoc,
} from "firebase/firestore";
import { FIRESTORE, ListReducerAction } from "../utils";
import { merge, set } from "lodash";

export interface ILocationContextProps {
  positions: string[];
  role: RoleAccessLevels;
  location?: ILocation;
  loading: boolean;
  error?: Error | undefined;
  employees: IEmployee[];
  scheduleSettings: IScheduleSettings;
  employeesDispatch: React.Dispatch<ListReducerAction<IEmployee>>;
  addPosition: (position: string) => Promise<void>;
  removePosition: (position: string) => Promise<void>;
  updateLocation: (newData: Partial<ILocation>) => Promise<void>;
  updateScheduleSettings: (
    newData: Partial<IScheduleSettings>
  ) => Promise<void>;
}

export const LocationContext = createContext<ILocationContextProps>(
  {} as ILocationContextProps
);

/**
 * Props del Provider principal de la App
 */
export interface ILocationProvider {
  children: ReactNode;
}

export const LocationProvider = ({ children }: ILocationProvider) => {
  const { onError, organizationKey } = useCuttinboard();
  if (!organizationKey) {
    throw new Error("No organization selected");
  }
  const {
    loading,
    error,
    location,
    employees,
    employeesDispatch,
    setLocation,
  } = useLocationData(organizationKey);

  const addPosition = useCallback(
    async (position: string) => {
      if (!location) {
        return;
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

      setLocation(localUpdates);
      try {
        await setDoc(docRef, serverUpdates, { merge: true });
      } catch (error) {
        setLocation(location);
        onError(error);
      }
    },
    [location, setLocation, onError]
  );

  const removePosition = useCallback(
    async (position: string) => {
      if (!location) {
        return;
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

      setLocation(localUpdates);
      try {
        await setDoc(docRef, serverUpdates, { merge: true });
      } catch (error) {
        setLocation(location);
        onError(error);
      }
    },
    [location, setLocation, onError]
  );

  const updateLocation = useCallback(
    async (newData: Partial<ILocation>) => {
      if (!location) {
        return;
      }
      const docRef = doc(FIRESTORE, location.refPath);

      const localUpdates = location;
      merge(localUpdates, newData);

      setLocation(localUpdates);
      try {
        await setDoc(docRef, newData, { merge: true });
      } catch (error) {
        setLocation(location);
        onError(error);
      }
    },
    [location, setLocation, onError]
  );

  const updateScheduleSettings = useCallback(
    async (newData: Partial<IScheduleSettings>) => {
      if (!location) {
        return;
      }
      const docRef = doc(FIRESTORE, location.refPath);

      const localUpdates = location;
      merge(localUpdates, { settings: { schedule: newData } });

      setLocation(localUpdates);
      try {
        await setDoc(
          docRef,
          { settings: { schedule: newData } },
          { merge: true }
        );
      } catch (error) {
        setLocation(location);
        onError(error);
      }
    },
    [location, setLocation, onError]
  );

  const memoizedValue = useMemo<ILocationContextProps>(() => {
    const { role, pos } = organizationKey;
    return {
      location: location,
      positions: pos || [],
      role,
      loading,
      error,
      employees,
      scheduleSettings: location?.settings?.schedule
        ? location?.settings?.schedule
        : DefaultScheduleSettings,
      employeesDispatch,
      addPosition,
      removePosition,
      updateLocation,
      updateScheduleSettings,
    };
  }, [
    organizationKey,
    location,
    loading,
    error,
    employees,
    employeesDispatch,
    addPosition,
    removePosition,
    updateLocation,
    updateScheduleSettings,
  ]);

  return (
    <LocationContext.Provider value={memoizedValue}>
      {children}
    </LocationContext.Provider>
  );
};
