import {
  IEmployee,
  IEmployeesDocument,
  IOrganizationEmployee,
} from "@cuttinboard-solutions/types-helpers";
import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";

export const employeesDocumentConverter: FirestoreDataConverter<IEmployeesDocument> =
  {
    toFirestore(object: IEmployeesDocument): DocumentData {
      return object;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<IEmployeesDocument>,
      options: SnapshotOptions
    ): IEmployeesDocument {
      const rawData = value.data(options);
      return rawData;
    },
  };

export const employeesArrayDocumentConverter: FirestoreDataConverter<
  IEmployeesDocument | IEmployee[]
> = {
  toFirestore(object: IEmployeesDocument): DocumentData {
    return object;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IEmployeesDocument>,
    options: SnapshotOptions
  ): IEmployee[] {
    const rawData = value.data(options);

    return rawData.employees ? Object.values(rawData.employees) : [];
  },
};

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
