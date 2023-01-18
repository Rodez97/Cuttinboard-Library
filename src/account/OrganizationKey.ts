import { RoleAccessLevels } from "../utils";

/**
 * The OrganizationKey interface implemented by the OrganizationKey class.
 */
export interface IOrganizationKey {
  role: RoleAccessLevels;
  orgId: string;
  locId: string;
  pos?: string[];
}
