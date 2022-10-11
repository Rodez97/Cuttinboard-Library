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
import { getDownloadURL, ref } from "firebase/storage";
import { FirebaseSignature } from "../FirebaseSignature";
import { PrimaryFirestore } from "../PrimaryFirestore";

/**
 * Archivo
 * @description Lo utilizamos para reflejar los objetos de storage en la app de drawers
 */
export interface ICuttinboard_File {
  /**
   * Nombre del archivo
   */
  name: string;
  /**
   * Referencia/Ruta del archivo en storage
   */
  storagePath: string;
  /**
   * MimeType del archivo
   */
  fileType: string;
  /**
   * Tamaño en bytes del archivo
   */
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
      const rawData = value.data(options)!;
      return new Cuttinboard_File(rawData, { id, docRef: ref });
    },
  };

  constructor(
    {
      name,
      storagePath,
      fileType,
      size,
      createdAt,
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

  public get fileRef() {
    return ref(Storage, this.storagePath);
  }

  public async getUrl() {
    if (this.downloadUrl) {
      return this.downloadUrl;
    }
    try {
      const url = await getDownloadURL(this.fileRef);
      this.downloadUrl = url;
      return url;
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

  public async rename(newName: string) {
    const filenameMath = this.name.match(/^(.*?)\.([^.]*)?$/);
    const oldName = filenameMath[1];
    const extension = filenameMath[2];
    if (newName === oldName) {
      return;
    }
    const name = `${newName}.${extension}`;
    try {
      await updateDoc(this.docRef, { name });
    } catch (error) {
      throw error;
    }
  }
}
