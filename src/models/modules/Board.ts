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

/**
 * Base interface implemented by Board class.
 */
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
  /**
   * The title given to the board.
   */
  public readonly name: string;
  /**
   * The description of the board.
   */
  public readonly description?: string;
  /**
   * An array of the ids of the hosts of this board.
   */
  public readonly hosts?: string[];
  /**
   * The id of the location this board is in.
   */
  public readonly locationId: string;
  /**
   * The privacy level of the board.
   * @see PrivacyLevel
   */
  public readonly privacyLevel: PrivacyLevel;
  /**
   * The access tags used to determine who can access this board.
   * [Access Tags](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/c4a61dda39bafb9c93841e88e18a6c170f3a51dd/src/models/boards/Board.MD)
   */
  public readonly accessTags?: string[];
  /**
   * The Id of the board
   */
  public readonly id: string;
  /**
   * The Firestore document reference of this board.
   */
  public readonly docRef: DocumentReference<DocumentData>;
  /**
   * The timestamp of when this board was created.
   */
  public readonly createdAt: Timestamp;
  /**
   * The id of the user who created this board.
   */
  public readonly createdBy: string;

  /**
   * Converts a QueryDocumentSnapshot to a Board class instance.
   */
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

  /**
   * Creates a new Board instance.
   * @param boardData The data to create the board with.
   * @param firestoreBase The id and docRef of the board.
   */
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
   * Reference of the content collection of this board.
   */
  public get contentRef() {
    return collection(Firestore, this.docRef.path, "content");
  }

  /**
   * Returns true if the current user is a host of this board.
   */
  public get amIhost() {
    if (!Auth.currentUser || !this.hosts) {
      return false;
    }
    return this.hosts.indexOf(Auth.currentUser.uid) > -1;
  }

  /**
   * Returns the position linked to this board.
   * @remarks
   * This method will return null if the privacy level is not set to positions.
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
   * Get the members of this board.
   * @remarks
   * This method will return null if the privacy level is not set to private.
   */
  public get getMembers() {
    if (this.privacyLevel !== PrivacyLevel.PRIVATE) {
      return null;
    }
    return this.accessTags ?? [];
  }

  /**
   * Updates the board with the given data.
   * @param updates The data to update.
   * @remarks
   * This method will only update the name, description, and access tags.
   */
  public async update(
    updates: PartialWithFieldValue<
      Pick<IBoard, "name" | "description" | "accessTags">
    >
  ) {
    await updateDoc(this.docRef, updates);
  }

  /**
   * Deletes the board.
   */
  public async delete() {
    await deleteDoc(this.docRef);
  }

  /**
   * Add a host to the board.
   * @param newHost The new host to add.
   */
  public async addHost(newHost: Employee) {
    const hostUpdate: { accessTags?: FieldValue; hosts: FieldValue } = {
      hosts: arrayUnion(newHost.id),
    };
    if (this.privacyLevel === PrivacyLevel.POSITIONS) {
      // If the board is position based, create a specific access tag for the host. (hostId_<hostId>)
      hostUpdate.accessTags = arrayUnion(`hostId_${newHost.id}`);
    }
    if (this.privacyLevel === PrivacyLevel.PRIVATE) {
      // If the board is private, add the host to the access tags.
      hostUpdate.accessTags = arrayUnion(newHost.id);
    }
    await updateDoc(this.docRef, hostUpdate);
  }

  /**
   * Remove a host from the board.
   * @param hostId The host to remove.
   */
  public async removeHost(hostId: string) {
    const hostUpdate: { accessTags?: FieldValue; hosts: FieldValue } = {
      hosts: arrayRemove(hostId),
    };
    if (this.privacyLevel === PrivacyLevel.POSITIONS) {
      // If the board is position based, remove the specific access tag for the host. (hostId_<hostId>)
      hostUpdate.accessTags = arrayRemove(`hostId_${hostId}`);
    }
    if (this.privacyLevel === PrivacyLevel.PRIVATE) {
      // If the board is private, remove the host from the access tags.
      hostUpdate.accessTags = arrayRemove(hostId);
    }
    await updateDoc(this.docRef, hostUpdate);
  }

  /**
   * Add new members to the board.
   * @param addedEmployees The employees to add.
   */
  public async addMembers(addedEmployees: Employee[]) {
    if (this.privacyLevel !== PrivacyLevel.PRIVATE) {
      // If the board is not private, throw an error.
      throw new Error("Cannot add members to a non private board.");
    }
    // Get the ids of the employees to add.
    const addedEmployeesIds = addedEmployees.map((e) => e.id);
    await updateDoc(this.docRef, {
      accessTags: arrayUnion(...addedEmployeesIds),
    });
  }

  /**
   * Remove a member from the board.
   * @param memberId The member to remove.
   */
  public async removeMember(memberId: string) {
    if (this.privacyLevel !== PrivacyLevel.PRIVATE) {
      // If the board is not private, throw an error.
      throw new Error("Cannot remove members from a non private board.");
    }
    await updateDoc(this.docRef, {
      accessTags: arrayRemove(memberId),
    });
  }
}
