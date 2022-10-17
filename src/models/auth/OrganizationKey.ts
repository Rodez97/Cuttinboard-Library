import { RoleAccessLevels } from "../../utils/RoleAccessLevels";
import { ILocationKey, LocationKey } from "./LocationKey";

export interface IOrganizationKey {
  orgId: string;
  role: RoleAccessLevels.ADMIN | RoleAccessLevels.OWNER | "employee";
  locKeys?: Record<string, ILocationKey>;
}

/**
 * Organization Key
 */
export class OrganizationKey {
  public readonly orgId: string;
  public readonly role:
    | RoleAccessLevels.OWNER
    | RoleAccessLevels.ADMIN
    | "employee";
  public readonly locKeys?: Record<string, LocationKey> = {};

  constructor({ orgId, role, locKeys }: IOrganizationKey) {
    this.orgId = orgId;
    this.role = role;
    if (locKeys) {
      let locationKeys: Record<string, LocationKey> = {};
      Object.entries(locKeys).forEach(([id, key]) => {
        locationKeys = { ...locationKeys, [id]: new LocationKey(key) };
      });
      this.locKeys = locationKeys;
    }
  }

  public locationKey(locationId: string) {
    if (this.role === "employee") {
      return this.locKeys?.[locationId];
    }
    return {
      locId: locationId,
      role: this.role,
      pos: [],
    };
  }
}
