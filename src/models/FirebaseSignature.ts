import { FieldValue, Timestamp } from "firebase/firestore";

/**
 * The basic information about a firestore document creation.
 */
export type FirebaseSignature<T extends Timestamp | FieldValue = Timestamp> = {
  /**
   * The date the document was created.
   */
  createdAt: T;
  /**
   * The id of the user that created the document.
   */
  createdBy: string;
};
