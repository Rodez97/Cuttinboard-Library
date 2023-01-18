import { STORAGE } from "../utils/firebase";
import {
  DocumentReference,
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { FirebaseSignature } from "../models/FirebaseSignature";
import { PrimaryFirestore } from "../models/PrimaryFirestore";

/**
 * Base interface implemented by [Cuttinboard_File] class.
 */
export interface ICuttinboard_File {
  name: string;
  storagePath: string;
  fileType: string;
  size: number;
}

/**
 * A class that represents a file uploaded to cloud storage from a Files Drawer.
 */
export class Cuttinboard_File
  implements ICuttinboard_File, PrimaryFirestore, FirebaseSignature
{
  /**
   * The mutable name of the file.
   */
  public readonly name: string;
  /**
   * The path to the file in cloud storage.
   */
  public readonly storagePath: string;
  /**
   * The mime type of the file.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
   */
  public readonly fileType: string;
  /**
   * The size of the file in bytes.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/File/size
   * @remarks
   * This is a read-only property.
   */
  public readonly size: number;
  /**
   * The id of the document in firestore.
   */
  public readonly id: string;
  /**
   * The document reference for this file in firestore.
   */
  public readonly docRef: DocumentReference<DocumentData>;
  /**
   * The timestamp of when this file was created
   */
  public readonly createdAt: Timestamp;
  /**
   * The id of the user who uploaded this file
   */
  public readonly createdBy: string;
  /**
   * The download URL for this file
   * @remarks
   * This is obtained from storage and is cached here.
   */
  private downloadUrl?: string;

  /**
   * Converts a firestore document snapshot to a [Cuttinboard_File] instance
   */
  public static firestoreConverter: FirestoreDataConverter<Cuttinboard_File> = {
    toFirestore(object: WithFieldValue<Cuttinboard_File>): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<ICuttinboard_File & FirebaseSignature>,
      options: SnapshotOptions
    ): Cuttinboard_File {
      const { id, ref } = value;
      const rawData = value.data(options);
      return new Cuttinboard_File(rawData, { id, docRef: ref });
    },
  };

  /**
   * Creates a new [Cuttinboard_File] instance
   * @param data The data to create this file with
   * @param firestoreBase The id and document reference for this file in firestore
   */
  constructor(
    {
      name,
      storagePath,
      fileType,
      size,
      createdAt: createdAt,
      createdBy,
    }: ICuttinboard_File & FirebaseSignature,
    { id, docRef }: PrimaryFirestore
  ) {
    this.name = name;
    this.storagePath = storagePath;
    this.fileType = fileType;
    this.size = size;
    this.id = id;
    this.docRef = docRef;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
  }

  /**
   * Returns the storage reference for this file
   */
  public get fileRef() {
    return ref(STORAGE, this.storagePath);
  }

  /**
   * Returns the download URL for this file
   * @remarks
   * This is cached in the [downloadUrl] property.
   */
  public async getUrl() {
    if (this.downloadUrl) {
      // If we already have the download URL, return it
      return this.downloadUrl;
    }
    // Otherwise, get the download URL from storage
    const url = await getDownloadURL(this.fileRef);
    this.downloadUrl = url;
    return url;
  }

  /**
   * Deletes this file from storage and firestore
   */
  public async delete() {
    // Delete the file from firestore
    await deleteDoc(this.docRef);
  }

  /**
   * Updates the name of this file
   * @param newName The new name for this file
   */
  public async rename(newName: string) {
    const filenameMath = this.name.match(/^(.*?)\.([^.]*)?$/);

    if (!filenameMath) {
      // If the filename doesn't match the regex, just throw an error
      throw new Error("Invalid filename");
    }

    const oldName = filenameMath[1];
    const extension = filenameMath[2];
    if (newName === oldName) {
      // If the new name is the same as the old name, just return
      return;
    }
    // Otherwise, update the name
    const name = `${newName}.${extension}`;
    await updateDoc(this.docRef, { name });
  }
}
