import { FieldValue, Timestamp } from "@firebase/firestore";

export type FirebaseSignature<T extends Timestamp | FieldValue = Timestamp> = {
  createdAt: T;
  createdBy: string;
};
