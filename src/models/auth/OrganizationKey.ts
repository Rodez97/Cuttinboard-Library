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
 */
type OrganizationRole =
  | RoleAccessLevels.ADMIN
  | RoleAccessLevels.OWNER
  | "employee";

/**
 * The OrganizationKey interface implemented by the OrganizationKey class.
 */
export interface IOrganizationKey {
  orgId: string;
  role: OrganizationRole;
  locKeys: LocationsKeyRing | undefined;
}

/**
 * The Organization Key contains the necessary information about the user's role and permissions within an organization and its locations.
 */
export class OrganizationKey {
  /**
   * The id of the organization.
   */
  public readonly orgId: string;
  /**
   * The role of the employee in the organization.
   */
  public readonly role: OrganizationRole;
  /**
   * The keys for the different locations that the employee has access to.
   */
  public readonly keyRing: Map<string, LocationKey> = new Map();

  /**
   * Creates a new instance of the OrganizationKey class.
   * @param keyData The organization key data.
   * @remarks
   * Since we get the locKeys as raw objects, we need to convert them to LocationKey objects.
   */
  constructor(keyData: IOrganizationKey) {
    const { orgId, role, locKeys } = keyData;
    this.orgId = orgId;
    this.role = role;
    if (locKeys) {
      Object.entries(locKeys).forEach(([locId, locKey]) => {
        this.keyRing.set(locId, new LocationKey(locKey));
      });
    }
  }

  /**
   * Returns the location key for the given locationId.
   */
  public getLocationKey(locationId: string): LocationKey | undefined {
    if (this.role === "employee") {
      /**
       * If the role is "employee", that means that the user is a location level employee and has an locationKey.
       */
      return this.keyRing.get(locationId);
    }
    /**
     * If the role is not "employee", that means that the user is an organization level employee and has access to all locations.
     * So we return a locationKey with the role of the organization level employee.
     */
    return new LocationKey({ role: this.role, locId: locationId });
  }
}
