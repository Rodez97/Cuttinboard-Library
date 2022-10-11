import { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  DocumentReference,
  Query,
  query,
  orderBy as orderByFirestore,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { ref, StorageReference } from "firebase/storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useRef,
} from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { LocationKey } from "../models/auth/LocationKey";
import { OrganizationKey } from "../models/auth/OrganizationKey";
import { Employee, IEmployee } from "../models/Employee";
import { Location } from "../models/Location";
import { RoleAccessLevels } from "../utils/RoleAccessLevels";
import { Auth, Firestore, Storage } from "../firebase";
import { CuttinboardError } from "../models/CuttinboardError";
import { FirebaseSignature } from "../models";

interface LocationContextProps {
  location: Location;
  isOwner: boolean;
  isGeneralManager: boolean;
  isManager: boolean;
  isAdmin: boolean;
  getAviablePositions: RoleAccessLevels[];
  locationAccessKey: LocationKey;
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
  children: ReactNode;
  LoadingElement: JSX.Element;
  organizationKey: OrganizationKey;
  locationId: string;
  ErrorElement: (
    error: Error | FirebaseError | CuttinboardError
  ) => JSX.Element;
}

export const LocationProvider = ({
  children,
  LoadingElement,
  organizationKey,
  locationId,
  ErrorElement,
}: LocationProviderProps) => {
  const [location, locationLoading, locationError] = useDocumentData<Location>(
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
    if (organizationKey.role === "employee") {
      return organizationKey.locKeys?.[locationId];
    }
    return {
      locId: locationId,
      role: organizationKey.role,
      pos: [],
    };
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

  if (locationLoading) {
    return LoadingElement;
  }

  if (locationError) {
    return ErrorElement(locationError);
  }

  if (!location) {
    return ErrorElement(
      new CuttinboardError("UNDEFINED_LOCATION", "Location is not defined")
    );
  }

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
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
