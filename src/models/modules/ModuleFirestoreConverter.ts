import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { PrimaryFirestore } from "../PrimaryFirestore";

export const ModuleFirestoreConverter = <T extends PrimaryFirestore>() => ({
  toFirestore(object: T): DocumentData {
    const { docRef, id, ...objectToSave } = object;
    return objectToSave;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot<T>,
    options: SnapshotOptions
  ): T {
    const data = snapshot.data(options)!;
    return {
      ...data,
      id: snapshot.id,
      docRef: snapshot.ref,
    };
  },
});
