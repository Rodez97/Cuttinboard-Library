import { DocumentData, DocumentReference } from "firebase/firestore";

/**
 * The basic information about a Firestore document.
 */
export type PrimaryFirestore = {
  /**
   * The ID of the document in the Firestore database.
   * - This is usually the same as the ID of the object in the database.
   */
  id: string;

  /**
   * A reference to the document in the Firestore database.
   */
  docRef: DocumentReference<DocumentData>;
};
