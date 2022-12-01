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
  FirestoreDataConverter,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { PrivacyLevel } from "../../utils/PrivacyLevel";
import { FirebaseSignature } from "../FirebaseSignature";
import { PrimaryFirestore } from "../PrimaryFirestore";
import { Employee } from "../Employee";

export interface IBoard {
  name: string;
  description?: string;
  hosts?: string[];
  locationId: string;
  privacyLevel: PrivacyLevel;
  accessTags?: string[];
}

/**
 * A class that represents a board in the database.
 */
export class Board implements IBoard, PrimaryFirestore, FirebaseSignature {
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

  public static Converter: FirestoreDataConverter<Board> = {
    toFirestore(object: Board): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<IBoard & FirebaseSignature>,
      options: SnapshotOptions
    ): Board {
      const { id, ref } = value;
      const rawData = value.data(options);
      return new Board(rawData, { id, docRef: ref });
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
      createdAt: createdAt,
      createdBy,
    }: IBoard & FirebaseSignature,
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

  /**
   * Reference of the content collection of this module.
   */
  public get contentRef() {
    return collection(Firestore, this.docRef.path, "content");
  }

  /**
   * Returns true if the current user is a host of this module.
   */
  public get amIhost() {
    if (!Auth.currentUser || !this.hosts) {
      return false;
    }
    return this.hosts.indexOf(Auth.currentUser.uid) > -1;
  }

  /**
   * Returns the position of this module only if the privacy level is set to positions.
   */
  public get position() {
    if (this.privacyLevel !== PrivacyLevel.POSITIONS || !this.accessTags) {
      return null;
    }
    return this.accessTags.find(
      (at) => at !== "pl_public" && !at.startsWith("hostId_")
    );
  }

  /**
   * Get the members of this module.
   */
  public get getMembers() {
    if (this.privacyLevel !== PrivacyLevel.PRIVATE) {
      return null;
    }
    return this.accessTags ?? [];
  }

  /**
   * Updates the module with the given data.
   * @param updates The data to update.
   */
  public async update(
    updates: PartialWithFieldValue<
      Pick<IBoard, "name" | "description" | "accessTags">
    >
  ) {
    await updateDoc(this.docRef, updates);
  }

  /**
   * Deletes the module.
   */
  public async delete() {
    await deleteDoc(this.docRef);
  }

  /**
   * Add a host to the module.
   * @param newHost The new host to add.
   */
  public async addHost(newHost: Employee) {
    const hostUpdate: { accessTags?: FieldValue; hosts: FieldValue } = {
      hosts: arrayUnion(newHost.id),
    };
    if (this.privacyLevel === PrivacyLevel.POSITIONS) {
      // If the module is position based, create a specific access tag for the host. (hostId_<hostId>)
      hostUpdate.accessTags = arrayUnion(`hostId_${newHost.id}`);
    }
    if (this.privacyLevel === PrivacyLevel.PRIVATE) {
      // If the module is private, add the host to the access tags.
      hostUpdate.accessTags = arrayUnion(newHost.id);
    }
    await updateDoc(this.docRef, hostUpdate);
  }

  /**
   * Remove a host from the module.
   * @param hostId The host to remove.
   */
  public async removeHost(hostId: string) {
    const hostUpdate: { accessTags?: FieldValue; hosts: FieldValue } = {
      hosts: arrayRemove(hostId),
    };
    if (this.privacyLevel === PrivacyLevel.POSITIONS) {
      // If the module is position based, remove the specific access tag for the host. (hostId_<hostId>)
      hostUpdate.accessTags = arrayRemove(`hostId_${hostId}`);
    }
    if (this.privacyLevel === PrivacyLevel.PRIVATE) {
      // If the module is private, remove the host from the access tags.
      hostUpdate.accessTags = arrayRemove(hostId);
    }
    await updateDoc(this.docRef, hostUpdate);
  }

  /**
   * Add new members to the module.
   * @param addedEmployees The employees to add.
   */
  public async addMembers(addedEmployees: Employee[]) {
    if (this.privacyLevel !== PrivacyLevel.PRIVATE) {
      // If the module is not private, throw an error.
      throw new Error("Cannot add members to a non private module.");
    }
    // Get the ids of the employees to add.
    const addedEmployeesIds = addedEmployees.map((e) => e.id);
    await updateDoc(this.docRef, {
      accessTags: arrayUnion(...addedEmployeesIds),
    });
  }

  /**
   * Remove a member from the module.
   * @param memberId The member to remove.
   */
  public async removeMember(memberId: string) {
    if (this.privacyLevel !== PrivacyLevel.PRIVATE) {
      // If the module is not private, throw an error.
      throw new Error("Cannot remove members from a non private module.");
    }
    await updateDoc(this.docRef, {
      accessTags: arrayRemove(memberId),
    });
  }
}
