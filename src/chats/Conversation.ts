import {
  arrayRemove,
  arrayUnion,
  QueryDocumentSnapshot,
  SnapshotOptions,
  updateDoc,
  DocumentData,
  DocumentReference,
  Timestamp,
  PartialWithFieldValue,
  deleteDoc,
  FieldValue,
  FirestoreDataConverter,
} from "firebase/firestore";
import { AUTH } from "../utils/firebase";
import { FirebaseSignature, PrimaryFirestore } from "../models";
import { PrivacyLevel } from "../utils";
import { Employee } from "../employee";

/**
 * Base interface implemented by Conversation class.
 */
export interface IConversation {
  muted?: string[];
  members?: string[];
  name: string;
  description?: string;
  hosts?: string[];
  locationId: string;
  privacyLevel: PrivacyLevel;
  position?: string;
}

/**
 * A Conversation is a conversation between two or more users.
 * - A conversations always takes place in a location.
 */
export class Conversation
  implements IConversation, PrimaryFirestore, FirebaseSignature
{
  /**
   * The id of the chat.
   */
  public readonly id: string;
  /**
   * The document reference of the chat.
   */
  public readonly docRef: DocumentReference<DocumentData>;
  /**
   * The muted array contains the ids of users who have muted this chat.
   */
  public readonly muted?: string[];
  /**
   * The members is an array of the ids of the users in the chat.
   */
  public readonly members?: string[];
  /**
   * The name of the chat.
   */
  public readonly name: string;
  /**
   * The description of the chat.
   */
  public readonly description?: string;
  /**
   * The hosts is an array of the ids of the hosts of the chat.
   */
  public readonly hosts?: string[];
  /**
   * The id of the location where the chat takes place.
   */
  public readonly locationId: string;
  /**
   * The privacy level of the chat.
   */
  public readonly privacyLevel: PrivacyLevel;
  /**
   * The position linked to the chat.
   */
  public readonly position?: string;
  /**
   * The timestamp of when the chat was created.
   */
  public readonly createdAt: Timestamp;
  /**
   * The id of the creator of the chat.
   */
  public readonly createdBy: string;

  /**
   * Convert a queryDocumentSnapshot to a Conversation class.
   */
  public static firestoreConverter: FirestoreDataConverter<Conversation> = {
    toFirestore(object: Conversation): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<IConversation & FirebaseSignature>,
      options: SnapshotOptions
    ): Conversation {
      const { id, ref } = value;
      const rawData = value.data(options);
      return new Conversation(rawData, { id, docRef: ref });
    },
  };

  /**
   * Create a new instance of a Conversation class.
   * @param data - The base data from which to create the conversation.
   * @param firestoreBase - The id and docRef of the document.
   */
  constructor(
    data: IConversation & FirebaseSignature,
    firestoreBase: PrimaryFirestore
  ) {
    const {
      name,
      description,
      hosts,
      locationId,
      privacyLevel,
      muted,
      createdAt: createdAt,
      createdBy,
      members,
      position,
    } = data;
    const { id, docRef } = firestoreBase;
    this.muted = muted;
    this.members = members;
    this.name = name;
    this.description = description;
    this.hosts = hosts;
    this.locationId = locationId;
    this.privacyLevel = privacyLevel;
    this.id = id;
    this.docRef = docRef;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.position = position;
  }

  /**
   * - If we have a recent message, we can use its timestamp to sort the chats.
   * - If we don't have a recent message, we can use the createdAt timestamp.
   */
  public get getOrderTime(): Date {
    return this.createdAt.toDate();
  }

  /**
   * Check if the current user is a host of this conversation.
   */
  public get iAmHost(): boolean {
    if (!AUTH.currentUser || !this.hosts) {
      return false;
    }
    return this.hosts.includes(AUTH.currentUser.uid);
  }

  /**
   * Check if the current user has muted this chat.
   */
  public get isMuted(): boolean {
    if (!AUTH.currentUser || !this.muted) {
      return false;
    }
    return this.muted.includes(AUTH.currentUser.uid);
  }

  /**
   * Check if the current user is a direct member of this conversation.
   */
  public get iAmMember(): boolean {
    if (!AUTH.currentUser || !this.members) {
      return false;
    }
    return this.members.includes(AUTH.currentUser.uid);
  }

  /**
   * Change the muted status of the current user by adding or removing their id from the muted array.
   */
  public async toggleMuteChat(): Promise<void> {
    if (!AUTH.currentUser) {
      throw new Error("You must be logged in to mute a chat.");
    }
    if (this.isMuted) {
      await updateDoc(this.docRef, {
        muted: arrayRemove(AUTH.currentUser.uid),
      });
    } else {
      await updateDoc(this.docRef, {
        muted: arrayUnion(AUTH.currentUser.uid),
      });
    }
  }

  /**
   * Adds a host to the conversation.
   * - The host is also added to the members array.
   */
  public addHost = async (newHost: Employee): Promise<void> =>
    await updateDoc(this.docRef, {
      members: arrayUnion(newHost.id),
      hosts: arrayUnion(newHost.id),
    });

  /**
   * Removes a host from the conversation.
   * - If the host meets the membership requirements, they will remain a member.
   */
  public async removeHost(host: Employee): Promise<void> {
    const hostUpdate: { members?: FieldValue; hosts: FieldValue } = {
      hosts: arrayRemove(host.id),
    };
    if (this.privacyLevel === PrivacyLevel.POSITIONS) {
      // Check if the host also has the position
      const hasPosition = this.position && host.hasAnyPosition([this.position]);

      if (!hasPosition) {
        // If not, remove from members
        hostUpdate.members = arrayRemove(host.id);
      }
    }
    if (this.privacyLevel === PrivacyLevel.PRIVATE) {
      hostUpdate.members = arrayRemove(host.id);
    }
    await updateDoc(this.docRef, hostUpdate);
  }

  /**
   * Adds a member to the conversation.
   * - We can only add members if the conversation is private.
   */
  public async addMembers(addedEmployees: Employee[]): Promise<void> {
    if (this.privacyLevel !== PrivacyLevel.PRIVATE) {
      // If the conversation is not private, we don't need to add members
      throw new Error("Cannot add members to a non-private conversation");
    }
    const members = addedEmployees.map((employee) => employee.id);
    await updateDoc(this.docRef, {
      members: arrayUnion(...members),
    });
  }

  /**
   * Removes a member from the conversation.
   * - We can only remove members if the conversation is private.
   */
  public async removeMember(memberId: string): Promise<void> {
    if (this.privacyLevel !== PrivacyLevel.PRIVATE) {
      // If the conversation is not private, we don't need to remove members
      throw new Error("Cannot remove members from a non-private conversation");
    }
    await updateDoc(this.docRef, {
      members: arrayRemove(memberId),
    });
  }

  /**
   * Update the public and writable fields of the conversation.
   * @description
   * **The fields that can be updated are:**
   * - name
   * - description
   * - position
   */
  public async update(
    updates: PartialWithFieldValue<
      Pick<IConversation, "name" | "description" | "position">
    >
  ): Promise<void> {
    await updateDoc(this.docRef, updates);
  }

  /**
   * Delete the conversation.
   */
  public delete = async (): Promise<void> => await deleteDoc(this.docRef);
}
