import { RoleAccessLevels } from "../../utils/RoleAccessLevels";
import { LocationKey } from "./LocationKey";

/**
 * LLave de la Organización
 */

export type OrganizationKey = {
  /**
   * ID de la Organización
   */
  orgId: string;
} & (
  | { role: RoleAccessLevels.ADMIN | RoleAccessLevels.OWNER }
  | { role: "employee"; locKeys: { [locationId: string]: LocationKey } }
);
