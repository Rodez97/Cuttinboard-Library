import React, { createContext, ReactElement, ReactNode } from "react";
import { Location } from "../models/Location";
import { RoleAccessLevels } from "../utils/RoleAccessLevels";
import { useLocationData } from "./useLocationData";
import { Employee } from "../employee";
import { IOrganizationKey } from "../account";

interface StateType {
  isOwner: boolean;
  isAdmin: boolean;
  isGeneralManager: boolean;
  isManager: boolean;
  availablePositions: RoleAccessLevels[];
  positions: string[];
  role: RoleAccessLevels;
}

export interface ILocationContext extends Omit<StateType, "initializing"> {
  location: Location;
  employees: Employee[];
  loading: boolean;
  error?: Error | null;
}

export const LocationContext = createContext<ILocationContext>(
  {} as ILocationContext
);

/**
 * Props del Provider principal de la App
 */
export interface ILocationProvider {
  children: ReactNode | ((context: ILocationContext) => JSX.Element);
  ErrorRenderer?: (error: Error) => JSX.Element;
  LoadingRenderer?: ReactElement;
  onLocationLoaded: (location: Location) => void;
  MissingLocationRenderer: () => JSX.Element;
  organizationKey: IOrganizationKey;
}

export const LocationProvider = ({
  children,
  ErrorRenderer,
  LoadingRenderer,
  onLocationLoaded,
  MissingLocationRenderer,
  organizationKey,
}: ILocationProvider) => {
  const { location, employees, loading, error } = useLocationData(
    organizationKey.locId,
    {
      onLocationLoaded,
    }
  );

  if (loading && LoadingRenderer) {
    return LoadingRenderer;
  }

  if (error && ErrorRenderer) {
    return ErrorRenderer(error);
  }

  if (!location) {
    return MissingLocationRenderer();
  }

  return (
    <LocationContext.Provider
      value={{
        location,
        employees,
        loading,
        error,
        isOwner: organizationKey.role === RoleAccessLevels.OWNER,
        isAdmin: organizationKey.role === RoleAccessLevels.ADMIN,
        isGeneralManager:
          organizationKey.role === RoleAccessLevels.GENERAL_MANAGER,
        isManager: organizationKey.role === RoleAccessLevels.MANAGER,
        availablePositions: Object.values(RoleAccessLevels).filter(
          (role) => role > organizationKey.role
        ) as RoleAccessLevels[],
        positions: organizationKey.pos ?? [],
        role: organizationKey.role,
      }}
    >
      {typeof children === "function"
        ? children({
            location,
            employees,
            loading,
            error,
            isOwner: organizationKey.role === RoleAccessLevels.OWNER,
            isAdmin: organizationKey.role === RoleAccessLevels.ADMIN,
            isGeneralManager:
              organizationKey.role === RoleAccessLevels.GENERAL_MANAGER,
            isManager: organizationKey.role === RoleAccessLevels.MANAGER,
            availablePositions: Object.values(RoleAccessLevels).filter(
              (role) => role > organizationKey.role
            ) as RoleAccessLevels[],
            positions: organizationKey.pos ?? [],
            role: organizationKey.role,
          })
        : children}
    </LocationContext.Provider>
  );
};
