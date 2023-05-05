import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  deleteField,
  doc,
  setDoc,
} from "firebase/firestore";
import { ref } from "firebase/storage";
import {
  getLocationStoragePath,
  ILocation,
} from "@cuttinboard-solutions/types-helpers";
import { httpsCallable } from "firebase/functions";
import { AUTH, FIRESTORE, FUNCTIONS, STORAGE } from "../utils/firebase";
import { employeesDocumentConverter } from "../employee/Employee";

export const locationConverter = {
  toFirestore(object: ILocation): DocumentData {
    const { refPath, id, ...objectToSave } = object;
    return objectToSave;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<ILocation>,
    options: SnapshotOptions
  ): ILocation {
    const { id, ref } = value;
    const rawData = value.data(options);
    return {
      ...rawData,
      id,
      refPath: ref.path,
    };
  },
};

/**
 * Gets the cloud storage reference for the location.
 */
export function getLocationStorageRef(location: ILocation) {
  return ref(STORAGE, getLocationStoragePath(location));
}

/**
 * Gets the employees reference for the location in firestore.
 */
export function getEmployeesRef(location: ILocation) {
  return doc(
    FIRESTORE,
    "Locations",
    location.id,
    "employees",
    "employeesDocument"
  ).withConverter(employeesDocumentConverter);
}

/**
 * If the user is the owner of the location. This method allows the user to join/leave the location as a member.
 * @param join True to join the location, false to leave the location.
 */
export async function joinLocation(location: ILocation) {
  const JoinLocation = httpsCallable<string, void>(
    FUNCTIONS,
    "http-employees-joinLocation"
  );

  await JoinLocation(location.id);
}

export async function leaveLocation(location: ILocation) {
  if (!AUTH.currentUser) {
    throw new Error("User is not logged in.");
  }
  await setDoc(
    doc(FIRESTORE, "Locations", location.id, "employees", "employeesDocument"),
    {
      employees: {
        [AUTH.currentUser.uid]: deleteField(),
      },
    },
    { merge: true }
  );
}
