import { FieldValue, Timestamp } from "@firebase/firestore";

/**
 * Atributos vinculados a la creación de documentos:
 * - Momento de su creación.
 * - UID del usuario que ha creado el documento.
 */
export type FirebaseSignature<T extends Timestamp | FieldValue = Timestamp> = {
  /**
   * Momento de creación del documento.
   */
  createdAt: T;
  /**
   * UID del usuario que ha creado el documento.
   */
  createdBy: string;
};
