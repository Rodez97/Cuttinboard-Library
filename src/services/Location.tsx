import { doc } from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { LocationKey } from "../models/auth/LocationKey";
import { OrganizationKey } from "../models/auth/OrganizationKey";
import { Location } from "../models/Location";
import { RoleAccessLevels } from "../utils/RoleAccessLevels";
import { Firestore } from "../firebase";

interface LocationContextProps {
  location: Location;
  isOwner: boolean;
  isGeneralManager: boolean;
  isManager: boolean;
  isAdmin: boolean;
  availablePositions: RoleAccessLevels[];
  locationAccessKey: LocationKey;
  loading: boolean;
  error?: Error;
}

const LocationContext = createContext<LocationContextProps>(
  {} as LocationContextProps
);

/**
 * Props del Provider principal de la App
 */
interface LocationProviderProps {
  children: ReactNode | ((location: Location) => JSX.Element);
  organizationKey: OrganizationKey;
  locationId: string;
  ErrorComponent: (error: Error) => JSX.Element;
  LoadingComponent: (loading: boolean) => JSX.Element;
}

type StateType = {
  initializing: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isGeneralManager: boolean;
  isManager: boolean;
  availablePositions: RoleAccessLevels[];
  locationAccessKey: LocationKey;
  error?: Error;
};

export const LocationProvider = ({
  children,
  organizationKey,
  locationId,
  ErrorComponent,
  LoadingComponent,
}: LocationProviderProps) => {
  const [state, setState] = useState<StateType>({
    initializing: true,
    isOwner: false,
    isAdmin: false,
    isGeneralManager: false,
    isManager: false,
    availablePositions: [],
    locationAccessKey: {} as LocationKey,
  });
  const [location, loading, error] = useDocumentData<Location>(
    doc(Firestore, "Locations", locationId).withConverter(Location.Converter)
  );

  useEffect(() => {
    if (location) {
      // If the location exist and is loaded, we check if the user has access to it
      const locKey = organizationKey.locationKey(locationId);
      if (!locKey) {
        // If the user doesn't have access to the location, we set the error
        setState({
          ...state,
          initializing: false,
          error: new Error("We couldn't find your location key"),
        });
        // Set global variable
        globalThis.locationData = undefined;
      } else {
        // If the user has access to the location, we set the location access key
        setState({
          initializing: false,
          isOwner: organizationKey.role === RoleAccessLevels.OWNER,
          isAdmin: organizationKey.role === RoleAccessLevels.ADMIN,
          isGeneralManager: locKey.role === RoleAccessLevels.GENERAL_MANAGER,
          locationAccessKey: locKey,
          isManager: locKey.role === RoleAccessLevels.MANAGER,
          availablePositions: Object.values(RoleAccessLevels).filter(
            (role) => role > locKey.role
          ) as RoleAccessLevels[],
          error: undefined,
        });
        globalThis.locationData = {
          id: locationId,
          name: location.name,
          role: locKey.role,
          organizationId: location.organizationId,
        };
      }
    } else if (!loading) {
      // If the location doesn't exist, we set the error
      setState({
        ...state,
        initializing: false,
        error: new Error("We couldn't find your location"),
      });
      globalThis.locationData = undefined;
    }
  }, [locationId, organizationKey, loading, error]);

  if (state.initializing) {
    return LoadingComponent(state.initializing);
  }

  if (state.error) {
    return ErrorComponent(state.error);
  }

  if (!location) {
    return ErrorComponent(new Error("We couldn't find your location"));
  }

  return (
    <LocationContext.Provider
      value={{
        location,
        ...state,
        loading,
        error,
      }}
    >
      {typeof children === "function" ? children(location) : children}
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
