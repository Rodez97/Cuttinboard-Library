import {
  DocumentReference,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  FirestoreDataConverter,
  collection,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { PrivacyLevel } from "../utils/PrivacyLevel";
import { PrimaryFirestore } from "../models/PrimaryFirestore";
import { IBoard } from "./Board";
import { FIRESTORE } from "../utils";

export type IGlobalBoard = Omit<IBoard, "hosts">;

export class GlobalBoard implements IBoard, PrimaryFirestore {
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly name: string;
  public readonly description?: string | undefined;
  public readonly parentId: string;
  public readonly privacyLevel: PrivacyLevel;
  public readonly accessTags?: string[] | undefined;
  public readonly global: boolean = true;

  public static firestoreConverter: FirestoreDataConverter<GlobalBoard> = {
    toFirestore(object: GlobalBoard): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<IBoard>,
      options: SnapshotOptions
    ): GlobalBoard {
      const { id, ref } = value;
      const rawData = value.data(options);
      return new GlobalBoard(rawData, { id, docRef: ref });
    },
  };

  constructor(
    data: IGlobalBoard,
    { id, docRef }: { id: string; docRef: DocumentReference<DocumentData> }
  ) {
    this.id = id;
    this.docRef = docRef;
    this.name = data.name;
    this.description = data.description;
    this.parentId = data.parentId;
    this.privacyLevel = data.privacyLevel;
    this.accessTags = data.accessTags;
    this.global = true;
  }

  /**
   * Reference of the content collection of this board.
   */
  public get contentRef() {
    return collection(FIRESTORE, this.docRef.path, "content");
  }

  /**
   * Updates the board with the given data.
   * @param updates The data to update.
   * @remarks
   * This method will only update the name and description.
   */
  public async update(updates: { name?: string; description?: string }) {
    await updateDoc(this.docRef, updates);
  }

  /**
   * Deletes the board.
   */
  public async delete() {
    await deleteDoc(this.docRef);
  }
}
