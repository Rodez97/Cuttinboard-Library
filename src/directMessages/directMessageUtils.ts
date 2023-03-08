import { IDirectMessage } from "@cuttinboard-solutions/types-helpers";
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";

export const directMessageConverter = {
  toFirestore(object: IDirectMessage): DocumentData {
    const { refPath, id, ...objectToSave } = object;
    return objectToSave;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IDirectMessage>,
    options: SnapshotOptions
  ): IDirectMessage {
    const { id, ref } = value;
    const rawData = value.data(options);
    return {
      ...rawData,
      id,
      refPath: ref.path,
    };
  },
};
