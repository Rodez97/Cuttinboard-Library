import { DocumentData, DocumentReference } from "@firebase/firestore";

/**
 * Atributos primarios de cualquier documento de **Firebase**
 */

export type PrimaryFirestore = {
  /**
   * ID del documento
   */
  id: string;
  /**
   * Referencia del documento en Firestore
   */
  docRef: DocumentReference<DocumentData>;
};
