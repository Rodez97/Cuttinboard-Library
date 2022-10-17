import {
  DocumentReference,
  DocumentData,
  Timestamp,
  QueryDocumentSnapshot,
  SnapshotOptions,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { FirebaseSignature } from "../FirebaseSignature";
import { PrimaryFirestore } from "../PrimaryFirestore";

export interface INote {
  title: string;
  content: string;
  authorName: string;
}

export class Note implements INote, PrimaryFirestore, FirebaseSignature {
  public readonly title: string;
  public readonly content: string;
  public readonly authorName: string;
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly createdAt: Timestamp;
  public readonly createdBy: string;

  public static Converter = {
    toFirestore(object: Note): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<INote & FirebaseSignature>,
      options: SnapshotOptions
    ): Note {
      const { id, ref } = value;
      const rawData = value.data(options)!;
      return new Note(rawData, { id, docRef: ref });
    },
  };

  constructor(
    {
      title,
      content,
      authorName,
      createdAt,
      createdBy,
    }: INote & FirebaseSignature,
    { id, docRef }: PrimaryFirestore
  ) {
    this.title = title;
    this.content = content;
    this.authorName = authorName;
    this.id = id;
    this.docRef = docRef;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
  }

  public get createdDate() {
    return this.createdAt.toDate();
  }

  public async edit(title: string, content: string) {
    try {
      await updateDoc(this.docRef, { title, content });
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
