import {
  IEmployee,
  IOrganizationEmployee,
} from "@cuttinboard-solutions/types-helpers";
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";

export const employeeConverter = {
  toFirestore(object: IEmployee): DocumentData {
    const { refPath, id, ...objectToSave } = object;
    return objectToSave;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IEmployee>,
    options: SnapshotOptions
  ): IEmployee {
    const { id, ref } = value;
    const rawData = value.data(options);
    return {
      ...rawData,
      id,
      refPath: ref.path,
    };
  },
};

export const orgEmployeeConverter = {
  toFirestore(object: IOrganizationEmployee): DocumentData {
    const { refPath, id, ...objectToSave } = object;
    return objectToSave;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IOrganizationEmployee>,
    options: SnapshotOptions
  ): IOrganizationEmployee {
    const { id, ref } = value;
    const rawData = value.data(options);
    return {
      ...rawData,
      id,
      refPath: ref.path,
    };
  },
};
