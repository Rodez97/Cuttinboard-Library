import { RoleAccessLevels } from "../utils/RoleAccessLevels";
import { FUNCTIONS } from "../utils/firebase";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { HttpsCallableResult } from "firebase/functions";

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
export const useEmployeeCreator = (): {
  /**
   * Method for creating a new employee
   */
  createEmployee: (
    data?: EmployeeData | undefined
  ) => Promise<HttpsCallableResult<EmployeeResponse> | undefined>;
  /**
   * Flag indicating whether the employee creation operation is in progress
   */
  loading: boolean;
  /**
   * Error object containing information about any error that occurred during the employee creation operation
   */
  error: Error | undefined;
} => {
  // Create a hook for the HTTPS callable function that accepts employee data and returns an employee response
  const [createEmployee, loading, error] = useHttpsCallable<
    EmployeeData,
    EmployeeResponse
  >(FUNCTIONS, "http-employees-create");

  // Return the hook and additional data for the employee creation operation
  return {
    createEmployee,
    loading,
    error,
  };
};
