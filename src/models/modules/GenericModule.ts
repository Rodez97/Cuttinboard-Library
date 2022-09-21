import { PrivacyLevel } from "../../utils/PrivacyLevel";
import { FirebaseSignature } from "../FirebaseSignature";
import { PrimaryFirestore } from "../PrimaryFirestore";
import { ModuleFirestoreConverter } from "./ModuleFirestoreConverter";

/**
 * Base genérica de la cuál parten la mayoría de apps o módulos de la aplicación.
 */

export type GenericModule = PrimaryFirestore &
  FirebaseSignature & {
    name: string;
    description?: string;
    /**
     * ID del usuario que actuará como Host (Administrador) de la app / pizarra.
     * - **Solo Managers o superiores puedes actuar como host**
     */
    hostId?: string;
    locationId: string;
    /**
     * Nivel de Privacidad de la app
     */
    privacyLevel: PrivacyLevel;
    accessTags?: string[];
  };

export const GenericModuleConverter = ModuleFirestoreConverter<GenericModule>();
