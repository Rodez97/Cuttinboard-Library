import { FirestoreError } from "firebase/firestore";
import React, { createContext, ReactElement, useContext, useMemo } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useCuttinboardLocation } from "../services/useCuttinboardLocation";
import { Employee } from "./Employee";

export interface IEmployeesContext {
  /**
   * Returns the list of employees fetched from the Firestore database.
   */
  getEmployees: Employee[];
  /**
   * Returns the employee with the specified id from the list of employees
   * fetched from the Firestore database. If no employee with the specified
   * id exists, returns `undefined`.
   */
  getEmployeeById: (id: string) => Employee | undefined;
  /**
   * Indicates whether the list of employees is currently being fetched from
   * the Firestore database.
   */
  loading: boolean;
  /**
   * If an error occurred while fetching the list of employees from the
   * Firestore database, this will contain the error object. Otherwise,
   * it will be `undefined`.
   */
  error: FirestoreError | undefined;
}

const EmployeesContext = createContext<IEmployeesContext>(
  {} as IEmployeesContext
);

/**
 * The `EmployeesProvider` component provides a context containing a list of
 * employees fetched from a Firestore database, as well as a loading state
 * and a method for retrieving an employee by id from the list of employees.
 *
 * It accepts the following props:
 *
 * - `children`: The React elements to render within the context provider.
 * - `ErrorRender`: A component to render when an error occurs while fetching
 *   the list of employees from the Firestore database. This component will be
 *   passed the error object as a prop.
 */
export const EmployeesProvider = ({
  children,
  ErrorRender,
}: {
  children: React.ReactNode;
  ErrorRender: (error: FirestoreError) => ReactElement;
}) => {
  const { location } = useCuttinboardLocation();
  const [employees, loading, error] = useCollectionData(location.employeesRef);

  const getEmployeeById = useMemo(
    () => (id: string) =>
      employees ? employees.find((employee) => employee.id === id) : undefined,
    [employees]
  );

  if (error) {
    return ErrorRender(error);
  }

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

/**
 * The `useEmployeesList` hook returns the context provided by the
 * `EmployeesProvider` component. It should be used within a component
 * that is a descendant of the `EmployeesProvider` component.
 *
 * If the `EmployeesProvider` is not present in the component tree, this
 * hook will throw an error.
 */
export const useEmployeesList = () => {
  const context = useContext(EmployeesContext);
  if (!context) {
    throw new Error("useEmployeesList must be used within a EmployeesProvider");
  }
  return context;
};
