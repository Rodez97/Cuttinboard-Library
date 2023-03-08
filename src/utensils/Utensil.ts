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
import { AUTH } from "../utils";

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
  const localUpdates: IUtensil = {
    ...utensil,
    currentQuantity: newCurrentQuantity,
    percent: newPercent,
    updatedAt,
  };

  if (utensil.changes && utensil.changes.length >= 50) {
    // Delete the oldest change
    const newList = utensil.changes.sort((a, b) => b.date - a.date);
    newList.pop();
    set(localUpdates, "changes", [...newList, newChange]);
    set(serverUpdates, "changes", [...newList, newChange]);
  } else {
    set(localUpdates, "changes", [...(utensil.changes || []), newChange]);
    set(serverUpdates, "changes", arrayUnion(newChange));
  }

  return { localUpdates, serverUpdates };
}
