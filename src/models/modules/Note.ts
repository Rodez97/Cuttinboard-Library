import {
  DocumentReference,
  DocumentData,
  Timestamp,
  QueryDocumentSnapshot,
  SnapshotOptions,
  updateDoc,
  deleteDoc,
  FirestoreDataConverter,
  serverTimestamp,
  CollectionReference,
  addDoc,
} from "firebase/firestore";
import { Auth } from "../../firebase";
import { PrimaryFirestore } from "../PrimaryFirestore";

export interface INote {
  title?: string;
  content: string;
  author: {
    id: string;
    name: string;
    at: Timestamp;
  };
  updated?: {
    id: string;
    name: string;
    at: Timestamp;
  };
}

export class Note implements INote, PrimaryFirestore {
  public readonly title?: string;
  public readonly content: string;
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly author: { id: string; name: string; at: Timestamp };
  public readonly updated?:
    | { id: string; name: string; at: Timestamp }
    | undefined;

  /**
   * Create a new note in the database and return it as a Note object instance with the id and docRef properties
   * @param contentRef The reference to the content collection
   * @param data The data to create the note with
   * @returns The new note as a Note object instance
   */
  public static NewNote = async (
    contentRef: CollectionReference,
    data: { title?: string; content: string }
  ) => {
    if (!Auth.currentUser || !Auth.currentUser.displayName) {
      throw new Error("You must be logged in to create a note.");
    }
    const author = {
      id: Auth.currentUser.uid,
      name: Auth.currentUser.displayName,
      at: serverTimestamp(),
    };
    const docRef = await addDoc(contentRef, {
      ...data,
      author,
    });
    return new Note(
      {
        ...data,
        author: {
          id: author.id,
          name: author.name,
          at: Timestamp.now(),
        },
      },
      {
        id: docRef.id,
        docRef,
      }
    );
  };

  public static Converter: FirestoreDataConverter<Note> = {
    toFirestore(object: Note): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<INote>,
      options: SnapshotOptions
    ): Note {
      const { id, ref } = value;
      const rawData = value.data(options);
      return new Note(rawData, { id, docRef: ref });
    },
  };

  constructor(
    { title, content, author, updated }: INote,
    { id, docRef }: PrimaryFirestore
  ) {
    this.title = title;
    this.content = content;
    this.id = id;
    this.docRef = docRef;
    this.author = author;
    this.updated = updated;
  }

  public get createdAt() {
    return this.author.at.toDate();
  }

  public async update(updates: Partial<{ title: string; content: string }>) {
    if (!Auth.currentUser || !Auth.currentUser.displayName) {
      throw new Error("You must be logged in to update a note.");
    }
    // Create a new updated object with the current user's id and name
    const updated = {
      id: Auth.currentUser.uid,
      name: Auth.currentUser.displayName,
      at: serverTimestamp(),
    };
    await updateDoc(this.docRef, {
      ...updates,
      updated,
    });
  }

  /**
   * Delete the note from the database
   */
  public async delete() {
    await deleteDoc(this.docRef);
  }
}
