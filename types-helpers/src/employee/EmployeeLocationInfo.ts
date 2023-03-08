import { RoleAccessLevels } from "../utils";

/**
 * This information is used to identify an employee's location.
 */
export type EmployeeLocationInfo = {
  /**
   * Record of the hourly wages for the employee for specific positions.
   * - The key is the position.
   * - The value is the hourly wage.
   */
  wagePerPosition?: Record<string, number>;

  /**
   * The preferred position of the employee at this location.
   * - This is the default and main position of the employee at this location.
   */
  mainPosition?: string;

  /**
   * The date the employee was hired at this location.
   */
  startDate: number;

  /**
   * Comments about this employee that may be needed on this location.
   */
  employeeDataComments?: string;

  /**
   * Documents related to this employee uploaded by their managers at this location.
   */
  employeeDocuments?: Record<string, string>;

  /**
   * The role of the employee in the location.
   */
  role: RoleAccessLevels;

  /**
   * The positions of the employee in the location.
   */
  positions?: string[];
};
