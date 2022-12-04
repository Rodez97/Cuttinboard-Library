import { FieldValue, Timestamp } from "firebase/firestore";
import { LocationKey } from "./auth/LocationKey";

/**
 * This data is used to identify an employee's location.
 */
export type EmployeeLocation = LocationKey & {
  /**
   * Record of the hourly wages for the employee for specific positions.
   * - The key is the position.
   * - The value is the hourly wage.
   */
  wagePerPosition?: Record<string, number>;
  /**
   * Comments about this employee that may be needed on this location.
   */
  employeeDataComments?: string;
  /**
   * The preferred position of the employee.
   * - This is the default and main position of the employee at this location.
   */
  mainPosition?: string;
  /**
   * The date the employee was hired.
   */
  startDate: FieldValue | Timestamp;
  /**
   * Documents related to this employee uploaded by their managers at this location
   */
  employeeDocuments?: Record<string, string>;
};
