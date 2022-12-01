import { RoleAccessLevels } from "../../utils/RoleAccessLevels";

/**
 * Base interface implemented by LocationKey class.
 */
export interface ILocationKey {
  locId: string;
  role: RoleAccessLevels;
  pos?: string;
}

/**
 * The key for a specific location.
 * @property `locId` The id of the location.
 * @property `role` The role of the employee in the location.
 * @property `pos` The position of the employee in the location.
 */
export class LocationKey {
  public readonly locId: string;
  public readonly role: RoleAccessLevels;
  public readonly pos?: string[];

  /**
   * Creates an instance of LocationKey.
   * Note: The positions are in the form of an array of strings,
   * but we get them from the organizationKey as a JSON string,
   * so we need to parse them.
   * @constructor
   * @param {ILocationKey} { locId, role, pos } The location key data.
   */
  constructor({ locId, role, pos }: ILocationKey) {
    this.locId = locId;
    this.role = role;
    // Parse the positions from the JSON string
    this.pos = pos ? JSON.parse(pos) : [];
  }
}
