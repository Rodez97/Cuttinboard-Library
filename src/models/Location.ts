import { FirebaseSignature } from "./FirebaseSignature";
import { ModuleFirestoreConverter } from "./modules";
import { PrimaryFirestore } from "./PrimaryFirestore";

/**
 * Locación
 * @description Una locación es el objeto primario alrededor del cuál se ejectutan todas las operaciones.
 */
export type Location = {
  /**
   * Nombre
   */
  name: string;
  /**
   * Descripción
   */
  description?: string;
  /**
   * Dirección de la locación
   */
  address?: Partial<{
    city: string;
    country: string;
    state: string;
    street: string;
    streetNumber: string;
    zip: string | number;
  }>;
  /**
   * Correo electrónico de la locación
   */
  email?: string;
  /**
   * Número de teléfono de la locación
   */
  phoneNumber?: string;
  /**
   * ID interno de la locación en caso de ser necesario por parte del cliente
   */
  intId?: string;
  /**
   * Estado actual de la suscripción vinculada a la locación y por ende la locación en si
   */
  subscriptionStatus:
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid";
  /**
   * Espacio de almacenamiento consumido por la locación en bytes
   */
  storageUsed: number;
  /**
   * Límites de la locación según su plan
   */
  limits: {
    /**
     * Límite maximo de empleados
     */
    employees: number;
    /**
     * Capacidad máxima de almacenamiento
     */
    storage: string;
  };
  organizationId: string;
  subscriptionId: string;
  subItemId: string;
  // Profile picture
  profilePicture?: string;
  members: string[];
  supervisors?: string[];
} & PrimaryFirestore &
  FirebaseSignature;

export const LocationConverter = ModuleFirestoreConverter<Location>();
