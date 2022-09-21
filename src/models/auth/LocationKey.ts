import { RoleAccessLevels } from "../../utils/RoleAccessLevels";

/**
 * Llave de la locación
 */
export type LocationKey = {
  locId: string;
  role: RoleAccessLevels;
  pos?: string[];
};
