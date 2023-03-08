import { intersection, orderBy } from "lodash";
import { BaseUser, ICuttinboardUser } from "../account";
import { RoleAccessLevels } from "../utils/RoleAccessLevels";
import { EmployeeLocationInfo } from "./EmployeeLocationInfo";

/**
 * Employee interface implemented by Employee class.
 */
export interface IEmployee extends BaseUser, EmployeeLocationInfo {
  /**
   * The ID of the organization that the employee belongs to.
   */
  organizationId: string;
}

/**
 * Employee interface implemented by Employee class.
 */
export interface IOrganizationEmployee extends BaseUser {
  /**
   * The ID of the organization that the employee belongs to.
   */
  organizationId: string;
  /**
   * The role of the employee.
   * - "employee" is the only role assigned to employees with roles <= `GENERAL_MANAGER`.
   * - `OWNER` and `ADMIN` are assigned to organization level roles.
   * @see {@link RoleAccessLevels}
   */
  role: RoleAccessLevels.ADMIN | RoleAccessLevels.OWNER;
  /**
   * Information about the locations where the employee works.
   * - The key is the location ID.
   * - The value is either a boolean indicating whether the employee works at the location,
   *   or an object containing additional details about the employee's work at the location.
   */
  locations?: string[];
  /**
   * A list of location IDs where the employee is a supervisor.
   */
  supervisingLocations?: string[];
}

/**
 * Gets the full name of the employee.
 */
export function getEmployeeFullName(employee: ICuttinboardUser) {
  return `${employee.name} ${employee.lastName}`;
}

/**
 * Calculates the hourly wage for the employee for a given position.
 * @param position The position to check.
 */
export function getEmployeeHourlyWage(employee: IEmployee, position: string) {
  if (
    !employee.positions ||
    !employee.positions.includes(position) ||
    !employee.wagePerPosition ||
    !employee.wagePerPosition[position]
  ) {
    return 0;
  }
  return employee.wagePerPosition[position];
}

/**
 * Checks if the employee have at least one of the positions.
 * @param positions The positions to check.
 */
export function checkEmployeePositions(
  employee: IEmployee,
  positions: string[]
) {
  if (!employee.positions) {
    return false;
  }
  return intersection(positions, employee.positions).length > 0;
}
