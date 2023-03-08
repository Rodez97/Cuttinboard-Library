import { ICuttinboardUser } from "@cuttinboard-solutions/types-helpers";
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";

export const cuttinboardUserConverter = {
  toFirestore(object: ICuttinboardUser): DocumentData {
    const { refPath, id, ...objectToSave } = object;
    return objectToSave;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<ICuttinboardUser>,
    options: SnapshotOptions
  ): ICuttinboardUser {
    const { id, ref } = value;
    const rawData = value.data(options);
    return {
      ...rawData,
      id,
      refPath: ref.path,
    };
  },
};
