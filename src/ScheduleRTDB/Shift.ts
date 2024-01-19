import {
  DocumentData,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { IShift } from "@rodez97/types-helpers";

export const shiftConverter = {
  toFirestore(object: PartialWithFieldValue<IShift>): DocumentData {
    return { ...object, updatedAt: new Date().getTime() };
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IShift>,
    options: SnapshotOptions
  ): IShift {
    const { id } = value;
    const rawData = value.data(options);
    return {
      ...rawData,
      id,
    };
  },
};
