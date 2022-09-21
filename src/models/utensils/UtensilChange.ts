import { FieldValue } from "@firebase/firestore";

/**
 * Registro de cambio en un utensilio
 */
export type UtensilChange = {
  /**
   * Cantidad del cambio
   */
  quantity: number;
  /**
   * Fecha en la que ocurrió el cambio
   */
  date: FieldValue;
  /**
   * UID del usuario que reportó el cambio
   */
  userId: string;
  /**
   * Razón/Descripción del cambio
   */
  reason?: string;
};
