import { DocumentData, DocumentReference } from "@firebase/firestore";

/**
 * The basic information about a firestore document.
 */
export type PrimaryFirestore = {
  /**
   * The id of the document.
   */
  id: string;
  /**
   * The reference to the document.
   */
  docRef: DocumentReference<DocumentData>;
};
