import { FirestoreError } from "firebase/firestore";
import React, { createContext, useCallback, useContext } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Employee } from "../models";
import { useLocation } from "./Location";

interface EmployeesContextProps {
  getEmployees: Employee[];
  getEmployeeById: (id: string) => Employee | undefined;
  loading: boolean;
  error: FirestoreError | undefined;
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
  const [employees, loading, error] = useCollectionData(location.employeesRef);

  const getEmployeeById = useCallback(
    (id: string) =>
      employees ? employees.find((employee) => employee.id === id) : undefined,
    [employees]
  );

  return (
    <EmployeesContext.Provider
      value={{
        getEmployees: employees ?? [],
        getEmployeeById,
        loading,
        error,
      }}
    >
      {children}
    </EmployeesContext.Provider>
  );
};

export const useEmployeesList = () => {
  const context = useContext(EmployeesContext);
  if (!context) {
    throw new Error("useEmployeesList must be used within a EmployeesProvider");
  }
  return context;
};
