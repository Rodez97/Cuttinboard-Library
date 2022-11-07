import { FirebaseError } from "firebase/app";
import { doc } from "firebase/firestore";
import React, { createContext, ReactNode, useContext, useMemo } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { LocationKey } from "../models/auth/LocationKey";
import { OrganizationKey } from "../models/auth/OrganizationKey";
import { Location } from "../models/Location";
import { RoleAccessLevels } from "../utils/RoleAccessLevels";
import { Firestore } from "../firebase";
import { CuttinboardError } from "../models/CuttinboardError";

interface LocationContextProps {
  location: Location;
  isOwner: boolean;
  isGeneralManager: boolean;
  isManager: boolean;
  isAdmin: boolean;
  getAviablePositions: RoleAccessLevels[];
  locationAccessKey: LocationKey;
  loading: boolean;
  error: Error | FirebaseError | CuttinboardError;
}

const LocationContext = createContext<LocationContextProps>(
  {} as LocationContextProps
);

/**
 * Props del Provider principal de la App
 */
interface LocationProviderProps {
  /**
   * El Contenido principal de la app cuando el usuario esté autentificado.
   */
  children:
    | ReactNode
    | ((props: {
        location: Location;
        loading: boolean;
        error: Error | FirebaseError | CuttinboardError;
      }) => JSX.Element);
  organizationKey: OrganizationKey;
  locationId: string;
}

export const LocationProvider = ({
  children,
  organizationKey,
  locationId,
}: LocationProviderProps) => {
  const [location, loading, error] = useDocumentData<Location>(
    locationId &&
      doc(Firestore, "Locations", locationId).withConverter(Location.Converter)
  );

  const isOwner = useMemo(
    () => organizationKey?.role === RoleAccessLevels.OWNER,
    [organizationKey]
  );

  const isAdmin = useMemo(
    () => organizationKey?.role === RoleAccessLevels.ADMIN,
    [organizationKey]
  );

  const locationAccessKey = useMemo((): LocationKey => {
    return organizationKey.locationKey(locationId);
  }, [organizationKey, locationId]);

  const isGeneralManager = useMemo(
    () => locationAccessKey?.role === RoleAccessLevels.GENERAL_MANAGER,
    [locationAccessKey]
  );

  const isManager = useMemo(
    () => locationAccessKey?.role === RoleAccessLevels.MANAGER,
    [locationAccessKey]
  );

  const getAviablePositions = useMemo(() => {
    const myRole = locationAccessKey?.role;
    return Object.values(RoleAccessLevels).filter(
      (role) => role > myRole
    ) as RoleAccessLevels[];
  }, [locationAccessKey]);

  const checkForError = useMemo(() => {
    if (loading) return null;

    // Check for location error
    if (error) {
      return error;
    }
    if (!location) {
      return new CuttinboardError(
        "Location not found",
        "The location you are trying to access does not exist or you don't have access to it."
      );
    }
  }, [loading, error, location]);

  return (
    <LocationContext.Provider
      value={{
        location,
        isOwner,
        isGeneralManager,
        isManager,
        getAviablePositions,
        isAdmin,
        locationAccessKey,
        loading,
        error,
      }}
    >
      {typeof children === "function"
        ? children({ location, loading, error: checkForError })
        : children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
