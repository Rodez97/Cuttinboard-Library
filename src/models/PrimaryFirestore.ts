import { DocumentData, DocumentReference } from "@firebase/firestore";

export type PrimaryFirestore = {
  id: string;

  docRef: DocumentReference<DocumentData>;
};
