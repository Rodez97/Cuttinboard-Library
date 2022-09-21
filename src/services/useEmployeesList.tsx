import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { collection, orderBy, query, where } from "firebase/firestore";
import { Employee, ModuleFirestoreConverter } from "../models";
import { RoleAccessLevels } from "../utils";
import { useLocation } from "./Location";
import { Firestore } from "../firebase";
import { uniqBy } from "lodash";

interface EmployeesContextProps {
  getOrgEmployees: (Employee & {
    role: RoleAccessLevels.ADMIN | RoleAccessLevels.OWNER;
  })[];
  getEmployees: (Employee & {
    role: "employee";
  })[];
  getUniqAllEmployees: () => Employee[];
}

const EmployeesContext = createContext<EmployeesContextProps>(
  {} as EmployeesContextProps
);

const OrgEmployeesConverter = ModuleFirestoreConverter<
  Employee & {
    role: RoleAccessLevels.ADMIN | RoleAccessLevels.OWNER;
  }
>();

const EmployeesConverter = ModuleFirestoreConverter<
  Employee & {
    role: "employee";
  }
>();

export const EmployeesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { location, locationId } = useLocation();
  const [orgEmployeesRequested, setOrgEmployeesRequested] = useState(false);
  const [employeesRequested, setEmployeesRequested] = useState(false);
  const [orgEmployees] = useCollectionData(
    orgEmployeesRequested &&
      query(
        collection(
          Firestore,
          "Organizations",
          location.organizationId,
          "employees"
        ),
        where("role", "in", [RoleAccessLevels.ADMIN, RoleAccessLevels.OWNER])
      ).withConverter(OrgEmployeesConverter)
  );
  const [employees] = useCollectionData(
    employeesRequested &&
      query(
        collection(
          Firestore,
          "Organizations",
          location.organizationId,
          "employees"
        ),
        orderBy(`locations.${locationId}`)
      ).withConverter(EmployeesConverter)
  );

  const getOrgEmployees = useMemo(() => {
    if (!orgEmployeesRequested) {
      setOrgEmployeesRequested(true);
    }
    return orgEmployees ?? [];
  }, [orgEmployeesRequested, orgEmployees]);

  const getEmployees = useMemo(() => {
    if (!employeesRequested) {
      setEmployeesRequested(true);
    }
    return employees ?? [];
  }, [employeesRequested, employees]);

  const getUniqAllEmployees = useCallback(
    () => uniqBy([...getEmployees, ...getOrgEmployees], "id"),
    [getOrgEmployees, getEmployees]
  );

  return (
    <EmployeesContext.Provider
      value={{ getOrgEmployees, getEmployees, getUniqAllEmployees }}
    >
      {children}
    </EmployeesContext.Provider>
  );
};

export const useEmployeesList = () => useContext(EmployeesContext);
