import { Auth } from "../../firebase";
import {
  DocumentReference,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
  serverTimestamp,
  setDoc,
  arrayUnion,
  PartialWithFieldValue,
  deleteDoc,
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
  tags?: string[];
  changes?: UtensilChange[];
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

  constructor(
    {
      name,
      description,
      optimalQuantity,
      currentQuantity,
      tags,
      changes,
      createdAt,
      createdBy,
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

  public get percent() {
    return Number.parseInt(
      ((this.currentQuantity / this.optimalQuantity) * 100).toFixed()
    );
  }

  public async addChange(quantity: number, reason?: string) {
    if (this.currentQuantity === 0 && quantity < 1) {
      return;
    }

    if (this.currentQuantity - quantity < 0) {
      return;
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

    try {
      if (this.changes?.length >= 50) {
        let newList = this.orderedChanges;
        pullAt(newList, [this.changes.length - 1]);
        await setDoc(
          this.docRef,
          {
            currentQuantity: this.currentQuantity + quantity,
            changes: [...newList, newChange],
          },
          { merge: true }
        );
      } else {
        await setDoc(
          this.docRef,
          {
            currentQuantity: this.currentQuantity + quantity,
            changes: arrayUnion(newChange),
          },
          { merge: true }
        );
      }
    } catch (error) {
      throw error;
    }
  }

  public async update(updates: PartialWithFieldValue<IUtensil>) {
    try {
      await setDoc(this.docRef, updates, { merge: true });
    } catch (error) {
      throw error;
    }
  }

  public async delete() {
    try {
      await deleteDoc(this.docRef);
    } catch (error) {
      throw error;
    }
  }
}
