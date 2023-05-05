import { IUtensil, UtensilChange } from "@cuttinboard-solutions/types-helpers";
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
  PartialWithFieldValue,
  arrayUnion,
} from "firebase/firestore";
import { set } from "lodash";
import { AUTH } from "../utils/firebase";

/* This code exports an object called `utensilConverter` that contains two functions: `toFirestore` and
`fromFirestore`. These functions are used to convert data between the format used by Firestore and
the format used by the application. */
export const utensilConverter = {
  toFirestore(object: IUtensil): DocumentData {
    const { refPath, id, ...objectToSave } = object;
    return objectToSave;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IUtensil>,
    options: SnapshotOptions
  ): IUtensil {
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
 * This function updates the quantity and percent of a utensil, adds a new change to its history, and
 * returns the local and server updates.
 * @param {IUtensil} utensil - an object representing a utensil, with properties such as
 * currentQuantity, optimalQuantity, and changes (an array of past changes made to the utensil)
 * @param {number} quantity - The quantity of the utensil being added or removed.
 * @param {string} [reason] - An optional string parameter that represents the reason for the utensil
 * change. It is used to provide additional context or explanation for the change. If not provided, it
 * will be undefined.
 * @returns An object with two properties: "localUpdates" and "serverUpdates".
 */
export function getNewUtensilChangeUpdates(
  utensil: IUtensil,
  quantity: number,
  reason?: string
) {
  if (!AUTH.currentUser) {
    throw new Error("User not logged in");
  }

  const updatedAt = Timestamp.now().toMillis();

  const newChange: UtensilChange = {
    quantity,
    reason,
    date: updatedAt,
    user: {
      userId: AUTH.currentUser.uid,
      userName:
        AUTH.currentUser.displayName ??
        AUTH.currentUser.email ??
        AUTH.currentUser.uid,
    },
  };
  const newCurrentQuantity = utensil.currentQuantity + quantity;
  const newPercent = Math.floor(
    (newCurrentQuantity / utensil.optimalQuantity) * 100
  );
  const serverUpdates: PartialWithFieldValue<IUtensil> = {
    currentQuantity: newCurrentQuantity,
    percent: newPercent,
    updatedAt,
  };

  if (utensil.changes && utensil.changes.length >= 50) {
    // Delete the oldest change
    const newList = utensil.changes.sort((a, b) => b.date - a.date);
    newList.pop();
    set(serverUpdates, "changes", [...newList, newChange]);
  } else {
    set(serverUpdates, "changes", arrayUnion(newChange));
  }

  return serverUpdates;
}
