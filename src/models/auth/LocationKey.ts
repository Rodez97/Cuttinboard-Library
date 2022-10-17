import { RoleAccessLevels } from "../../utils/RoleAccessLevels";

export interface ILocationKey {
  locId: string;
  role: RoleAccessLevels;
  pos?: string;
}

/**
 * Locations Key
 */
export class LocationKey {
  public readonly locId: string;
  public readonly role: RoleAccessLevels;
  public readonly pos?: string[];

  constructor({ locId, role, pos }: ILocationKey) {
    this.locId = locId;
    this.role = role;
    this.pos = pos ? JSON.parse(pos) : [];
  }
}
