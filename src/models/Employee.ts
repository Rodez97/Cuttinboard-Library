import { RoleAccessLevels } from "../utils/RoleAccessLevels";
import { CuttinboardUser } from "./CuttinboardUser";
import { EmployeeLocation } from "./EmployeeLocation";
import { FirebaseSignature } from "./FirebaseSignature";
import { ModuleFirestoreConverter } from "./modules";
import { PrimaryFirestore } from "./PrimaryFirestore";

/**
 * Empleado
 */

export type Employee = PrimaryFirestore &
  FirebaseSignature &
  CuttinboardUser & {
    preferredName?: string;
    emergencyContact?: { name?: string; phoneNumber: string };
    contactComments?: string;
    /******************** Role, Positions & Hourly Wages **********************/
    /**
     * Tokens de expo para el envío de notificaciones
     */
    expoToolsTokens?: string[];
    /**
     * Es dueño de la locación?
     */
    organizationId: string;
  } & (
    | {
        /**
         * Rol del empeado en la locación
         */
        role: RoleAccessLevels.ADMIN | RoleAccessLevels.OWNER;
        locations?: { [locationId: string]: boolean };
        supervisingLocations?: string[];
      }
    | {
        role: "employee";
        locations: { [locationId: string]: EmployeeLocation };
      }
  );

export const EmployeeConverter = ModuleFirestoreConverter<Employee>();
