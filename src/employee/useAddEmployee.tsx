import { FIRESTORE, FUNCTIONS } from "../utils/firebase";
import { useCallback } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import {
  getLocationUsage,
  ManagerPermissions,
  RoleAccessLevels,
} from "@rodez97/types-helpers";
import { useCuttinboardLocation } from "../cuttinboardLocation";

/**
 * Type for employee data
 */
type EmployeeData = {
  name: string;
  lastName: string;
  email: string;
  role:
    | RoleAccessLevels.GENERAL_MANAGER
    | RoleAccessLevels.MANAGER
    | RoleAccessLevels.STAFF;
  positions: string[];
  wagePerPosition: Record<string, number>;
  mainPosition: string;
  locationId: string;
  permissions?: ManagerPermissions;
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
export const useAddEmployee = () => {
  const { location, employees } = useCuttinboardLocation();

  const addEmployee = useCallback(
    async (values: Omit<EmployeeData, "locationId">) => {
      // Check if the employee already exists
      const employee = employees.find(
        (employee) => employee.email === values.email
      );
      // If the employee already exists, return an error
      if (employee) {
        return Promise.reject(
          new Error("Employee already exists in your location")
        );
      }

      const usage = getLocationUsage(location);

      // Check if we have reached the maximum number of employees
      if (usage.employeesCount >= usage.employeesLimit) {
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
          where("email", "==", values.email)
        )
      );
      if (checkForSupervisor.size === 1) {
        throw new Error("Employee is already an organization level employee");
      }

      const createEmployee = httpsCallable<EmployeeData, EmployeeResponse>(
        FUNCTIONS,
        "http-employees-create"
      );

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
    [employees, location]
  );

  return addEmployee;
};
