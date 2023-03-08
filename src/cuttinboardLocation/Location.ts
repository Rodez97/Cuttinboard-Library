import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  collection,
} from "firebase/firestore";
import { ref } from "firebase/storage";
import { FIRESTORE, FUNCTIONS, STORAGE } from "../utils/firebase";
import { employeeConverter } from "../employee/Employee";
import {
  getLocationStoragePath,
  ILocation,
} from "@cuttinboard-solutions/types-helpers";
import { httpsCallable } from "firebase/functions";

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
  return collection(
    FIRESTORE,
    "Locations",
    location.id,
    "employees"
  ).withConverter(employeeConverter);
}

/**
 * If the user is the owner of the location. This method allows the user to join/leave the location as a member.
 * @param join True to join the location, false to leave the location.
 */
export async function joinLocation(location: ILocation, join: boolean) {
  const JoinLocation = httpsCallable<
    { locationId: string; join?: boolean },
    void
  >(FUNCTIONS, "http-employees-joinLocation");

  await JoinLocation({
    locationId: location.id,
    join,
  });
}

/**
 * If the user is a supervisor of the location. This method allows the user to join/leave the location as a member.
 * @param join True to join the location, false to leave the location.
 */
export async function supervisorJoinLocation(
  location: ILocation,
  uid: string,
  join: boolean
) {
  if (!location.supervisors || !location.supervisors.includes(uid)) {
    throw new Error("User is not a supervisor of this location.");
  }
  await joinLocation(location, join);
}
