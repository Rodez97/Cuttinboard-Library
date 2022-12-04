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
 */
export class LocationKey {
  /**
   * The id of the location.
   */
  public readonly locId: string;
  /**
   * The role of the employee in the location.
   */
  public readonly role: RoleAccessLevels;
  /**
   * The positions of the employee in the location.
   */
  public readonly pos?: string[];

  /**
   * Creates a new instance of the LocationKey class.
   * @param keyData The location key data.
   * @remarks
   * The positions are in the form of an array of strings,
   * but we get them from the organizationKey as a JSON string,
   * so we need to parse them.
   */
  constructor(keyData: ILocationKey) {
    const { locId, role, pos } = keyData;
    this.locId = locId;
    this.role = role;
    // Parse the positions from the JSON string
    this.pos = pos ? JSON.parse(pos) : [];
  }
}
