import { Storage } from "../../firebase";
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
import { deleteObject, getDownloadURL, ref } from "firebase/storage";
import { FirebaseSignature } from "../FirebaseSignature";
import { PrimaryFirestore } from "../PrimaryFirestore";

export interface ICuttinboard_File {
  name: string;
  storagePath: string;
  fileType: string;
  size: number;
}

export class Cuttinboard_File
  implements ICuttinboard_File, PrimaryFirestore, FirebaseSignature
{
  public readonly name: string;
  public readonly storagePath: string;
  public readonly fileType: string;
  public readonly size: number;
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly createdAt: Timestamp;
  public readonly createdBy: string;
  private downloadUrl?: string;

  public static Converter: FirestoreDataConverter<Cuttinboard_File> = {
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
    return ref(Storage, this.storagePath);
  }

  /**
   * Returns the download URL for this file
   * @returns The download URL for this file
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
    // Delete the file from storage
    await deleteObject(this.fileRef);
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
