import { Auth, Firestore } from "../../firebase";
import {
  DocumentReference,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
  setDoc,
  arrayUnion,
  deleteDoc,
  serverTimestamp,
  addDoc,
  collection,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { FirebaseSignature } from "../FirebaseSignature";
import { PrimaryFirestore } from "../PrimaryFirestore";
import { UtensilChange } from "./UtensilChange";
import { orderBy, pullAt } from "lodash";

export interface IUtensil {
  name: string;
  description?: string;
  optimalQuantity: number;
  currentQuantity: number;
  readonly percent: number;
  tags?: string[];
  changes?: UtensilChange[];
  locationId: string;
}

export class Utensil implements IUtensil, PrimaryFirestore, FirebaseSignature {
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly name: string;
  public readonly description?: string;
  public readonly optimalQuantity: number;
  public readonly currentQuantity: number;
  public readonly tags?: string[];
  public readonly changes?: UtensilChange[];
  public readonly createdAt: Timestamp;
  public readonly createdBy: string;
  public readonly locationId: string;
  public readonly percent: number;

  public static Converter = {
    toFirestore(object: Utensil): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<IUtensil & FirebaseSignature>,
      options: SnapshotOptions
    ): Utensil {
      const { id, ref } = value;
      const rawData = value.data(options)!;
      return new Utensil(rawData, { id, docRef: ref });
    },
  };

  public static NewUtensil = async (
    values: Omit<IUtensil, "percent">,
    organizationId: string
  ) => {
    if (!Auth.currentUser) {
      throw new Error("User not logged in");
    }

    // Calculate percent
    const percent = Number.parseInt(
      ((values.currentQuantity / values.optimalQuantity) * 100).toFixed()
    );

    const newUtensil: WithFieldValue<IUtensil & FirebaseSignature> = {
      ...values,
      percent,
      createdAt: serverTimestamp(),
      createdBy: Auth.currentUser.uid,
    };

    await addDoc(
      collection(Firestore, "Organizations", organizationId, "utensils"),
      newUtensil
    );
  };

  constructor(
    {
      name,
      description,
      optimalQuantity,
      currentQuantity,
      tags,
      changes,
      createdAt: createdAt,
      createdBy,
      locationId,
      percent,
    }: IUtensil & FirebaseSignature,
    { id, docRef }: PrimaryFirestore
  ) {
    this.id = id;
    this.docRef = docRef;
    this.name = name;
    this.description = description;
    this.optimalQuantity = optimalQuantity;
    this.currentQuantity = currentQuantity;
    this.tags = tags;
    this.changes = changes;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.locationId = locationId;
    this.percent = percent;
  }

  public get createdAtDate() {
    return this.createdAt.toDate();
  }

  public get orderedChanges() {
    return orderBy(this.changes, "date", "desc");
  }

  public get lastChange() {
    return this.orderedChanges[0];
  }

  public async addChange(quantity: number, reason?: string) {
    if (this.currentQuantity + quantity < 0) {
      throw new Error("Can't have less than 0 utensils");
    }

    if (!Auth.currentUser || !Auth.currentUser.displayName) {
      throw new Error("User not logged in");
    }

    const newChange: WithFieldValue<UtensilChange> = {
      quantity,
      reason,
      date: Timestamp.now(),
      user: {
        userId: Auth.currentUser.uid,
        userName: Auth.currentUser.displayName,
      },
    };

    const newCurrentQuantity = this.currentQuantity + quantity;

    const newPercent = Number.parseInt(
      ((newCurrentQuantity / this.optimalQuantity) * 100).toFixed()
    );

    if (this.changes && this.changes.length >= 50) {
      const newList = this.orderedChanges;
      pullAt(newList, [this.changes.length - 1]);
      await setDoc(
        this.docRef,
        {
          currentQuantity: newCurrentQuantity,
          changes: [...newList, newChange],
          percent: newPercent,
        },
        { merge: true }
      );
    } else {
      await setDoc(
        this.docRef,
        {
          currentQuantity: newCurrentQuantity,
          changes: arrayUnion(newChange),
          percent: newPercent,
        },
        { merge: true }
      );
    }
  }

  public async update(updates: Partial<IUtensil>) {
    let newPercent = 0;
    // Recalculate percent
    if (updates.currentQuantity && updates.optimalQuantity) {
      newPercent = Number.parseInt(
        ((updates.currentQuantity / updates.optimalQuantity) * 100).toFixed()
      );
    } else if (updates.currentQuantity) {
      newPercent = Number.parseInt(
        ((updates.currentQuantity / this.optimalQuantity) * 100).toFixed()
      );
    } else if (updates.optimalQuantity) {
      newPercent = Number.parseInt(
        ((this.currentQuantity / updates.optimalQuantity) * 100).toFixed()
      );
    } else {
      newPercent = this.percent;
    }

    await setDoc(
      this.docRef,
      {
        ...updates,
        percent: newPercent,
      },
      { merge: true }
    );
  }

  public async delete() {
    await deleteDoc(this.docRef);
  }
}
