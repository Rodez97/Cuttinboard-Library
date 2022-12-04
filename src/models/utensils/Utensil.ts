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

/**
 * Base interface implemented by Utensil class.
 */
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

/**
 * A class that represents a utensil in the database.
 * - A utensil is a document that can be attached to a Utensils board.
 * - Utensils are objects that are used in the restaurant.
 */
export class Utensil implements IUtensil, PrimaryFirestore, FirebaseSignature {
  /**
   * Id of the document.
   */
  public readonly id: string;
  /**
   * Document reference of the document.
   */
  public readonly docRef: DocumentReference<DocumentData>;
  /**
   * Name of the utensil.
   */
  public readonly name: string;
  /**
   * Short description of the utensil.
   */
  public readonly description?: string;
  /**
   * Optimal quantity of the utensil.
   * - The optimal quantity is the quantity that the restaurant should have to be able to operate normally.
   */
  public readonly optimalQuantity: number;
  /**
   * Current quantity of the utensil.
   * - The current quantity is the quantity that the restaurant currently has in stock.
   */
  public readonly currentQuantity: number;
  /**
   * Tags used to categorize the utensil.
   */
  public readonly tags?: string[];
  /**
   * List of the 50 most recent changes to the utensil.
   */
  public readonly changes?: UtensilChange[];
  /**
   * Timestamp of when the document was created.
   */
  public readonly createdAt: Timestamp;
  /**
   * Id of the user that created the document.
   */
  public readonly createdBy: string;
  /**
   * Id of the location that the utensil is attached to.
   */
  public readonly locationId: string;
  /**
   * Percent that te current quantity is of the optimal quantity.
   */
  public readonly percent: number;

  /**
   * Firestore Data Converter for Utensil class.
   */
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
      const rawData = value.data(options);
      return new Utensil(rawData, { id, docRef: ref });
    },
  };

  /**
   * - Create a new utensil.
   * - Add it to the database.
   * - Calculate the percent.
   * @param values Data to create a new utensil.
   */
  public static NewUtensil = async (values: Omit<IUtensil, "percent">) => {
    if (!Auth.currentUser) {
      throw new Error("User not logged in");
    }

    if (!globalThis.locationData) {
      throw new Error("Organization not selected");
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
      collection(
        Firestore,
        "Organizations",
        globalThis.locationData.organizationId,
        "utensils"
      ),
      newUtensil
    );
  };

  /**
   * Create a new utensil instance.
   * @param data Data to create a new utensil class instance.
   * @param firestoreBase The id and document reference of the document.
   */
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

  /**
   * Creation date of the document.
   */
  public get createdAtDate() {
    return this.createdAt.toDate();
  }

  /**
   * Get the changes of the utensil ordered by date.
   */
  public get orderedChanges() {
    return orderBy(this.changes, "date", "desc");
  }

  /**
   * Get the last change made to the utensil.
   */
  public get lastChange() {
    return this.orderedChanges[0];
  }

  /**
   * Update the current quantity of the utensil by adding a new change.
   * @param quantity Quantity to add to the current quantity. (Can be negative)
   * @param reason Reason for the change.
   * @remarks
   * Since we only store the 50 most recent changes, we need to delete the oldest change if there are more than 50 changes.
   */
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
      // Delete the oldest change
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

  /**
   * Update the utensil data.
   * @param updates Updates to make to the utensil.
   * @remarks
   * This method will also update the percentage if the current amount or optimal amount is updated.
   */
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

  /**
   * Delete the utensil.
   */
  public async delete() {
    await deleteDoc(this.docRef);
  }
}
