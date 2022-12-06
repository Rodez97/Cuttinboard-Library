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
import { AUTH } from "../utils/firebase";
import { PrimaryFirestore } from "../models/PrimaryFirestore";

/**
 * Base interface implemented by Note class.
 */
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

/**
 * A class that represents a note in the database.
 * - A note is a document that can be attached to a Notes board.
 */
export class Note implements INote, PrimaryFirestore {
  /**
   * The title of the note.
   */
  public readonly title?: string;
  /**
   * The content of the note.
   * - This is the main body of the note.
   * - This is the only required field.
   */
  public readonly content: string;
  /**
   * The id of the note.
   */
  public readonly id: string;
  /**
   * The document reference of the note.
   */
  public readonly docRef: DocumentReference<DocumentData>;
  /**
   * The author of the note.
   */
  public readonly author: {
    /**
     * The id of the author.
     */
    id: string;
    /**
     * The full name of the author.
     */
    name: string;
    /**
     * The timestamp of when the note was created.
     */
    at: Timestamp;
  };
  /**
   * The data associated with the last update to the note.
   */
  public readonly updated?:
    | {
        /**
         * The id of the user who last updated the note.
         */
        id: string;
        /**
         * The full name of the user who last updated the note.
         */
        name: string;
        /**
         * The timestamp of when the note was last updated.
         */
        at: Timestamp;
      }
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
    if (!AUTH.currentUser || !AUTH.currentUser.displayName) {
      throw new Error("You must be logged in to create a note.");
    }
    const author = {
      id: AUTH.currentUser.uid,
      name: AUTH.currentUser.displayName,
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

  /**
   * Convert a QueryDocumentSnapshot to a Note object instance
   */
  public static firestoreConverter: FirestoreDataConverter<Note> = {
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

  /**
   * Create a new Note object instance
   * @param data The data to create the note with
   * @param firestoreBase The id and docRef of the note
   */
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

  /**
   * The creation date of the note
   */
  public get createdAt() {
    return this.author.at.toDate();
  }

  /**
   * Update the note in the database
   * @param updates The updates to make to the note
   */
  public async update(updates: Partial<{ title: string; content: string }>) {
    if (!AUTH.currentUser || !AUTH.currentUser.displayName) {
      throw new Error("You must be logged in to update a note.");
    }
    // Create a new updated object with the current user's id and name
    const updated = {
      id: AUTH.currentUser.uid,
      name: AUTH.currentUser.displayName,
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
