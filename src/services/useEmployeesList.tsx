import React, { createContext, useContext, useMemo, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Employee } from "../models";
import { useLocation } from "./Location";

interface EmployeesContextProps {
  getEmployees: Employee[];
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

  const [employees, loading, error] = useCollectionData(
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

  return (
    <EmployeesContext.Provider value={{ getEmployees }}>
      {children}
    </EmployeesContext.Provider>
  );
};

export const useEmployeesList = () => useContext(EmployeesContext);
