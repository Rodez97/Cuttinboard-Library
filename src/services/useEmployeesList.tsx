import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Employee } from "../models";
import { useLocation } from "./Location";

interface EmployeesContextProps {
  getEmployees: Employee[];
  getEmployeeById: (id: string) => Employee;
}

const EmployeesContext = createContext<EmployeesContextProps>(
  {} as EmployeesContextProps
);

export const EmployeesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { location } = useLocation();
  const [employeesRequested, setEmployeesRequested] = useState(false);

  const [employees] = useCollectionData(
    employeesRequested && location.employeesRef
  );

  const getEmployees = useMemo(() => {
    if (!employeesRequested) {
      setEmployeesRequested(true);
    }
    const employeesWithLocationId = employees ?? [];
    employeesWithLocationId.forEach((employee) => {
      employee.locationId = location.id;
    });
    return employeesWithLocationId;
  }, [employeesRequested, employees, location.id]);

  const getEmployeeById = useCallback(
    (id: string) => {
      return getEmployees.find((employee) => employee.id === id);
    },
    [getEmployees]
  );

  return (
    <EmployeesContext.Provider value={{ getEmployees, getEmployeeById }}>
      {children}
    </EmployeesContext.Provider>
  );
};

export const useEmployeesList = () => useContext(EmployeesContext);
