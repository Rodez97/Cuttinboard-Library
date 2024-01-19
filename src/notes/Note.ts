import { INote } from "@rodez97/types-helpers";
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";

export const noteConverter = {
  toFirestore(object: INote): DocumentData {
    const { refPath, id, ...objectToSave } = object;
    return objectToSave;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<INote>,
    options: SnapshotOptions
  ): INote {
    const { id, ref } = value;
    const rawData = value.data(options);
    return {
      ...rawData,
      id,
      refPath: ref.path,
    };
  },
};
