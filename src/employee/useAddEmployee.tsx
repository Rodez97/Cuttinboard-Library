import { RoleAccessLevels } from "../utils/RoleAccessLevels";
import { FIRESTORE, FUNCTIONS } from "../utils/firebase";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { useEmployeesList } from "./useEmployeesList";
import { useCallback } from "react";
import { useCuttinboardLocation } from "../services";
import { collection, getDocs, query, where } from "firebase/firestore";

/**
 * Type for employee data
 */
type EmployeeData = {
  name: string;
  lastName: string;
  email: string;
  /**
   * Role access level for the employee
   */
  role: RoleAccessLevels | "employee";
  /**
   * Array of positions held by the employee
   */
  positions: string[];
  /**
   * Record mapping position names to their respective wage
   */
  wagePerPosition: Record<string, number>;
  /**
   * The employee's main position
   */
  mainPosition: string;
  /**
   * The ID of the location where the employee works
   */
  locationId: string;
};

/**
 * Type for the response of the employee creation function
 */
type EmployeeResponse = {
  /**
   * Status of the employee creation operation
   */
  status: "ADDED" | "CREATED" | "ALREADY_MEMBER" | "CANT_ADD_ORG_EMP";
  /**
   * ID of the created employee
   */
  employeeId: string;
};

/**
 * Hook for creating employees using an HTTPS callable function
 */
export const useAddEmployee = (): {
  /**
   * Method for creating a new employee
   */
  addEmployee: (values: Omit<EmployeeData, "locationId">) => Promise<string>;
  /**
   * Flag indicating whether the employee creation operation is in progress
   */
  loading: boolean;
  /**
   * Error object containing information about any error that occurred during the employee creation operation
   */
  error: Error | undefined;
} => {
  const { location } = useCuttinboardLocation();
  const { getEmployees } = useEmployeesList();
  // Create a hook for the HTTPS callable function that accepts employee data and returns an employee response
  const [createEmployee, loading, error] = useHttpsCallable<
    EmployeeData,
    EmployeeResponse
  >(FUNCTIONS, "http-employees-create");

  const addEmployee = useCallback(
    async (values: Omit<EmployeeData, "locationId">) => {
      // Check if the employee already exists
      const employee = getEmployees.find(
        (employee) => employee.email === values.email
      );
      // If the employee already exists, return an error
      if (employee) {
        return Promise.reject(
          new Error("Employee already exists in your location")
        );
      }
      // Check if we have reached the maximum number of employees
      if (location.usage.employeesCount >= location.usage.employeesLimit) {
        return Promise.reject(new Error("Maximum number of employees reached"));
      }
      // Check if the new employee is already an organization level employee
      const checkForSupervisor = await getDocs(
        query(
          collection(
            FIRESTORE,
            "Organizations",
            location.organizationId,
            "employees"
          ),
          where("email", "==", values.email),
          where("role", "in", [0, 1])
        )
      );
      if (checkForSupervisor.size === 1) {
        return Promise.reject(
          new Error("Employee is already an organization level employee")
        );
      }

      // Create the employee
      const result = await createEmployee({
        ...values,
        locationId: location.id,
      });

      if (!result || !result.data) {
        return Promise.reject(
          new Error(
            "There was an error creating the employee. Please try again"
          )
        );
      }

      const { status } = result.data;

      switch (status) {
        case "CANT_ADD_ORG_EMP":
          return Promise.reject(
            new Error(
              "Employee is already an organization level employee. Please contact support if you need help"
            )
          );
        case "CREATED":
          return Promise.resolve(
            "An account has been created and a temporary password has been emailed to this user"
          );
        case "ADDED":
        case "ALREADY_MEMBER":
          return Promise.resolve(
            "Employee has been added to your location. Please contact them to set up their account"
          );
        default:
          return Promise.reject(
            new Error(
              "There was an error creating the employee. Please try again"
            )
          );
      }
    },
    [location, getEmployees]
  );

  // Return the hook and additional data for the employee creation operation
  return {
    addEmployee,
    loading,
    error,
  };
};
