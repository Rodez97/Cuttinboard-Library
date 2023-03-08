/**
 * Access roles for an employee in an organization or a location.
 */
export enum RoleAccessLevels {
  /**
   * The owner of the organization.
   * - Has full access to the organization and all of its locations.
   */
  OWNER = 0,
  /**
   * Admin role is used for employees are supervisors of locations.
   * - Has full access to all the locations they are supervisors of.
   */
  ADMIN = 1,
  /**
   * General manager role is used for employees that are the general managers of locations.
   * - Has full access to the location they are the general manager of.
   */
  GENERAL_MANAGER = 2,
  /**
   * Managers are intermediate level employees that have higher access than regular employees.
   * - They can do everything that regular employees can do, but they can also do some things that regular employees can't do.
   */
  MANAGER = 3,
  /**
   * Regular employees are the lowest level employees.
   */
  STAFF = 4,
}

/**
 * Compare two role access levels and return true if the first role has higher access than the second role.
 * @param userRole The role of the user.
 * @param employeeRole The role of the employee.
 * @returns True if the user has higher access than the employee.
 */
export const CompareRoles = (
  userRole: RoleAccessLevels,
  employeeRole: RoleAccessLevels
) => {
  return userRole < employeeRole;
};

/**
 * Get the role access level for the given employee as string (e.g. "owner", "manager", "employee")
 * @param role Access level of the employee
 * @returns Role access level as a string
 */
export const roleToString = (role: RoleAccessLevels) => {
  const roleEntry = Object.entries(RoleAccessLevels).find(
    ([, n]) => n === role
  );
  return roleEntry ? roleEntry[0] : "STAFF";
};
