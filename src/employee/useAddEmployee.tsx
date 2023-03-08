import { FIRESTORE, FUNCTIONS } from "../utils/firebase";
import { useCallback } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { employeesSelectors } from "./employees.slice";
import { useAppSelector } from "../reduxStore";
import { selectLocation } from "../cuttinboardLocation/locationSelectors";
import {
  getLocationUsage,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";

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
  role:
    | RoleAccessLevels.GENERAL_MANAGER
    | RoleAccessLevels.MANAGER
    | RoleAccessLevels.STAFF;
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
export const useAddEmployee = () => {
  const activeLocation = useAppSelector(selectLocation);
  if (!activeLocation) {
    throw new Error("No active location");
  }
  const activeEmployees = useAppSelector(employeesSelectors.selectAll);

  const addEmployee = useCallback(
    async (values: Omit<EmployeeData, "locationId">) => {
      // Check if the employee already exists
      const employee = activeEmployees.find(
        (employee) => employee.email === values.email
      );
      // If the employee already exists, return an error
      if (employee) {
        return Promise.reject(
          new Error("Employee already exists in your location")
        );
      }

      const usage = getLocationUsage(activeLocation);

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
            activeLocation.organizationId,
            "employees"
          ),
          where("email", "==", values.email)
        )
      );
      if (checkForSupervisor.size === 1) {
        return Promise.reject(
          new Error("Employee is already an organization level employee")
        );
      }

      const createEmployee = httpsCallable<EmployeeData, EmployeeResponse>(
        FUNCTIONS,
        "http-employees-create"
      );

      // Create the employee
      const result = await createEmployee({
        ...values,
        locationId: activeLocation.id,
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
    [activeEmployees, activeLocation]
  );

  return addEmployee;
};
