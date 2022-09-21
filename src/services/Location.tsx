import { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  DocumentReference,
  Query,
  query,
  orderBy as orderByFirestore,
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
import { Employee, EmployeeConverter } from "../models/Employee";
import { Location, LocationConverter } from "../models/Location";
import { RoleAccessLevels } from "../utils/RoleAccessLevels";
import { Auth, Firestore, Storage } from "../firebase";
import { CuttinboardError } from "../models/CuttinboardError";

interface LocationContextProps {
  /**
   * Locación actualmente seleccionada
   */
  location: Partial<Location>;
  /**
   * Referencia al documento principal que posee la información de la locación seleccionada
   */
  locationDocRef: DocumentReference;
  /**
   * Referencia al espacio de almacenamiento principal designado para esta locación
   */
  locationStorageRef: StorageReference;
  /**
   * Referencia al documento contenedor de la plantilla de miembros/empleados de la locación
   */
  employeesCollRef: Query<Employee>;
  /**
   * Si el usuario actual es el dueño de la locación
   */
  isOwner: boolean;
  /**
   * Si el usuario actual es Gerente General de la locación
   */
  isGeneralManager: boolean;
  /**
   * Si el usuario actual es Gerente de la locación
   */
  isManager: boolean;
  isAdmin: boolean;
  /**
   * Lista de roles que el usuario actual puede asignar a otro usuario de menor rango
   */
  getAviablePositions: RoleAccessLevels[];
  /**
   * Uso y límites de la cuenta según el plan de pago de la locación
   */
  usage: {
    /**
     * Cantidad actual de empleados
     */
    employeesCount: number;
    /**
     * Máximo de empleados permitidos
     */
    employeesLimit: number;
    /**
     * Capacidad de almacenamiento consumida por el usuario
     */
    storageUsed: number;
    /**
     * Capacidad máxima de almacenamiento permitida
     */
    storageLimit: number;
  };
  locationAccessKey: LocationKey;
  locationId: string;
  employeeProfile: Employee;
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
  const locationDocRef = useRef(
    doc(Firestore, "Locations", locationId).withConverter(LocationConverter)
  );
  const employeesCollRef = useRef(
    query(
      collection(
        Firestore,
        "Organizations",
        organizationKey.orgId,
        "employees"
      ),
      orderByFirestore(`locations.${locationId}`)
    ).withConverter(EmployeeConverter)
  );
  const locationStorageRef = useRef(
    ref(
      Storage,
      `organizations/${organizationKey.orgId}/locations/${locationId}`
    )
  );
  const [location, locationLoading, locationError] = useDocumentData<Location>(
    locationDocRef.current
  );
  const [employeeProfile, loadingEmployeeProfile, employeeProfileError] =
    useDocumentData<Employee>(
      doc(
        Firestore,
        "Organizations",
        organizationKey.orgId,
        "employees",
        Auth.currentUser.uid
      ).withConverter(EmployeeConverter)
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

  const usage = useMemo(
    () => ({
      employeesCount: Number(location?.members?.length ?? 0),
      employeesLimit: Number(location?.limits.employees ?? 0),
      storageUsed: Number(location?.storageUsed ?? 0),
      storageLimit: Number(location?.limits.storage ?? 0),
    }),
    [location]
  );

  if (locationLoading || loadingEmployeeProfile) {
    return LoadingElement;
  }

  if (locationError || employeeProfileError) {
    return ErrorElement(locationError ?? employeeProfileError);
  }

  if (!location) {
    return ErrorElement(
      new CuttinboardError("UNDEFINED_LOCATION", "Location is not defined")
    );
  }

  if (!employeeProfile) {
    return ErrorElement(
      new CuttinboardError("UNDEFINED_EMPLOYEE", "Employee is not defined")
    );
  }

  return (
    <LocationContext.Provider
      value={{
        location,
        locationDocRef: locationDocRef.current,
        locationStorageRef: locationStorageRef.current,
        employeesCollRef: employeesCollRef.current,
        isOwner,
        isGeneralManager,
        isManager,
        getAviablePositions,
        usage,
        isAdmin,
        locationAccessKey,
        locationId,
        employeeProfile,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
