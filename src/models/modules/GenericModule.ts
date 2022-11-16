import { Auth, Firestore } from "../../firebase";
import {
  DocumentReference,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  collection,
  updateDoc,
  PartialWithFieldValue,
  deleteDoc,
  FieldValue,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { PrivacyLevel } from "../../utils/PrivacyLevel";
import { FirebaseSignature } from "../FirebaseSignature";
import { PrimaryFirestore } from "../PrimaryFirestore";
import { Employee } from "../Employee";

export interface IGenericModule {
  name: string;
  description?: string;
  hosts?: string[];
  locationId: string;
  privacyLevel: PrivacyLevel;
  accessTags?: string[];
}

export class GenericModule
  implements IGenericModule, PrimaryFirestore, FirebaseSignature
{
  public readonly name: string;
  public readonly description?: string;
  public readonly hosts?: string[];
  public readonly locationId: string;
  public readonly privacyLevel: PrivacyLevel;
  public readonly accessTags?: string[];
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly createdAt: Timestamp;
  public readonly createdBy: string;

  public static Converter = {
    toFirestore(object: GenericModule): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<IGenericModule & FirebaseSignature>,
      options: SnapshotOptions
    ): GenericModule {
      const { id, ref } = value;
      const rawData = value.data(options)!;
      return new GenericModule(rawData, { id, docRef: ref });
    },
  };

  constructor(
    {
      name,
      description,
      hosts,
      locationId,
      privacyLevel,
      accessTags,
      createdAt,
      createdBy,
    }: IGenericModule & FirebaseSignature,
    { id, docRef }: PrimaryFirestore
  ) {
    this.name = name;
    this.description = description;
    this.hosts = hosts;
    this.locationId = locationId;
    this.privacyLevel = privacyLevel;
    this.accessTags = accessTags;
    this.id = id;
    this.docRef = docRef;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
  }

  public get contentRef() {
    return collection(Firestore, this.docRef.path, "content");
  }

  public get getOrderTime() {
    return this.createdAt.toDate();
  }

  public get amIhost() {
    return Boolean(this.hosts?.indexOf(Auth.currentUser.uid) > -1);
  }

  public get position() {
    if (this.privacyLevel !== PrivacyLevel.POSITIONS) {
      return null;
    }
    return this.accessTags?.find(
      (at) => at !== "pl_public" && !at.startsWith("hostId_")
    );
  }

  public get getMembers() {
    if (this.privacyLevel !== PrivacyLevel.PRIVATE) {
      return null;
    }
    return this.accessTags;
  }

  public async update(
    updates: PartialWithFieldValue<
      Pick<IGenericModule, "name" | "description" | "accessTags">
    >
  ) {
    try {
      await updateDoc(this.docRef, updates);
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

  public async addHost(newHost: Employee) {
    try {
      const hostUpdate: { accessTags?: FieldValue; hosts: FieldValue } = {
        hosts: arrayUnion(newHost.id),
      };
      if (this.privacyLevel === PrivacyLevel.POSITIONS) {
        hostUpdate.accessTags = arrayUnion(`hostId_${newHost.id}`);
      }
      if (this.privacyLevel === PrivacyLevel.PRIVATE) {
        hostUpdate.accessTags = arrayUnion(newHost.id);
      }
      await updateDoc(this.docRef, hostUpdate);
    } catch (error) {
      throw error;
    }
  }

  public async removeHost(hostId: string) {
    try {
      const hostUpdate: { accessTags?: FieldValue; hosts: FieldValue } = {
        hosts: arrayRemove(hostId),
      };
      if (this.privacyLevel === PrivacyLevel.POSITIONS) {
        hostUpdate.accessTags = arrayRemove(`hostId_${hostId}`);
      }
      if (this.privacyLevel === PrivacyLevel.PRIVATE) {
        hostUpdate.accessTags = arrayRemove(hostId);
      }
      await updateDoc(this.docRef, hostUpdate);
    } catch (error) {
      throw error;
    }
  }

  public async addMembers(addedEmployees: Employee[]) {
    if (this.privacyLevel !== PrivacyLevel.PRIVATE) {
      return;
    }
    try {
      await updateDoc(this.docRef, {
        accessTags: arrayUnion(...addedEmployees.map((emp) => emp.id)),
      });
    } catch (error) {
      throw error;
    }
  }

  public async removeMember(memberId: string) {
    if (this.privacyLevel !== PrivacyLevel.PRIVATE) {
      return;
    }
    try {
      await updateDoc(this.docRef, {
        accessTags: arrayRemove(memberId),
      });
    } catch (error) {
      throw error;
    }
  }
}
