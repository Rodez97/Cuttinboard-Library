import { RoleAccessLevels } from "../../utils/RoleAccessLevels";
import { ILocationKey, LocationKey } from "./LocationKey";

/**
 * A *[key - value]* pair of locationId and LocationKey
 * - This is used to store the different locations that an employee has access to, and their role in each location.
 */
type LocationsKeyRing = Record<string, ILocationKey>;

/**
 * The role of the employee in the organization.
 * - "OWNER" Employees have full access to the organization and all of its locations.
 * - "ADMIN" Employees have full access to all the locations they are supervisors of.
 * - "employee" => The rest of the roles are always linked to specific locations, so they are location level employees.
 * @date 1/12/2022 - 18:47:26
 *
 * @typedef {OrganizationRole}
 */
type OrganizationRole =
  | RoleAccessLevels.ADMIN
  | RoleAccessLevels.OWNER
  | "employee";

export interface IOrganizationKey {
  orgId: string;
  role: OrganizationRole;
  locKeys: LocationsKeyRing | undefined;
}

/**
 * The Organization Key contains the necessary information about the user's role and permissions within an organization and its locations.
 * @date 1/12/2022 - 18:48:07
 *
 * @export
 * @class OrganizationKey
 */
export class OrganizationKey {
  public readonly orgId: string;
  public readonly role: OrganizationRole;
  public readonly locKeys: Map<string, LocationKey> = new Map();

  constructor({ orgId, role, locKeys }: IOrganizationKey) {
    this.orgId = orgId;
    this.role = role;
    if (locKeys) {
      // Since we get the locKeys as raw objects, we need to convert them to LocationKey objects.
      Object.entries(locKeys).forEach(([locId, locKey]) => {
        this.locKeys.set(locId, new LocationKey(locKey));
      });
    }
  }

  /**
   * Returns the location key for the given locationId.
   * @date 1/12/2022 - 18:48:26
   *
   * @public
   * @param {string} locationId The id of the location to check.
   * @returns {(LocationKey | undefined)} {LocationKey} The location key for the given locationId.
   */
  public locationKey(locationId: string): LocationKey | undefined {
    if (this.role === "employee") {
      // If the role is "employee", that means that the user is a location level employee and has an locationKey.
      return this.locKeys.get(locationId);
    }
    // If the role is not "employee", that means that the user is an organization level employee and has access to all locations.
    // So we return a locationKey with the role of the organization level employee.
    return new LocationKey({ role: this.role, locId: locationId });
  }
}
