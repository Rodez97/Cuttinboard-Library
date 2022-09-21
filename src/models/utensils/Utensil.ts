import { FirebaseSignature } from "../FirebaseSignature";
import { PrimaryFirestore } from "../PrimaryFirestore";
import { UtensilChange } from "./UtensilChange";

/**
 * Utensilio
 */
export type Utensil = PrimaryFirestore &
  FirebaseSignature & {
    name: string;
    description?: string;
    /**
     * Cantidad óptima
     */
    optimalQuantity: number;
    /**
     * Cantidad actual
     */
    currentQuantity: number;
    /**
     * Etiquetas
     */
    tags?: string[];
    /**
     * Cambios recientes
     */
    changes?: UtensilChange[];
  };
