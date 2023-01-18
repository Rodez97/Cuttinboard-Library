import {
  arrayRemove,
  arrayUnion,
  QueryDocumentSnapshot,
  SnapshotOptions,
  updateDoc,
  DocumentData,
  DocumentReference,
  Timestamp,
  deleteDoc,
  FieldValue,
  FirestoreDataConverter,
  WithFieldValue,
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
  name: string;
  description?: string;
  hosts?: string[];
  locationId: string;
  privacyLevel: PrivacyLevel;
  position?: string;
  organizationId: string;
  members?: string[];
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

  public readonly organizationId: string;

  public readonly members?: string[];

  /**
   * Convert a queryDocumentSnapshot to a Conversation class.
   */
  public static firestoreConverter: FirestoreDataConverter<Conversation> = {
    toFirestore(object: WithFieldValue<Conversation>): DocumentData {
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
      createdAt,
      createdBy,
      position,
      organizationId,
      members,
    } = data;
    const { id, docRef } = firestoreBase;
    this.muted = muted;
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
    this.organizationId = organizationId;
    this.members = members;
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
    // Check if the user is logged in
    if (!AUTH.currentUser) {
      throw new Error("You must be logged in to mute a chat.");
    }

    if (!this.iAmMember) {
      throw new Error("You must be a member of the chat to mute it.");
    }

    if (this.isMuted) {
      // If the chat is currently muted, update the chat document to remove the current user's UID from the "muted" array field
      await updateDoc(this.docRef, {
        muted: arrayRemove(AUTH.currentUser.uid),
      });
    } else {
      // If the chat is not currently muted, update the chat document to add the current user's UID to the "muted" array field
      await updateDoc(this.docRef, {
        muted: arrayUnion(AUTH.currentUser.uid),
      });
    }
  }

  /**
   * Adds a host to the conversation.
   * @param newHost An object representing the host to be added.
   */
  public addHost = async (newHost: Employee): Promise<void> => {
    await updateDoc(this.docRef, {
      hosts: arrayUnion(newHost.id),
      members: arrayUnion(newHost.id),
    });
  };

  /**
   * Removes a host from the conversation.
   * @param host An object representing the host to be removed.
   */
  public async removeHost(host: Employee): Promise<void> {
    // Initialize an object to store updates to the conversation document
    const conversationUpdates: {
      // Set the hosts property to an array with the host's ID removed
      hosts: FieldValue;
      // Initialize the accessTags and muted properties to undefined
      members?: FieldValue;
      muted?: FieldValue;
    } = {
      hosts: arrayRemove(host.id),
    };

    if (
      (this.privacyLevel === PrivacyLevel.POSITIONS &&
        this.position &&
        !host.hasAnyPosition([this.position])) ||
      this.privacyLevel === PrivacyLevel.PRIVATE
    ) {
      conversationUpdates.members = arrayRemove(host.id);
      conversationUpdates.muted = arrayRemove(host.id);
    }

    await updateDoc(this.docRef, conversationUpdates);
  }

  /**
   * Adds a member to the conversation.
   *
   * @param newMembers An array of Employee objects representing the new members to add to the conversation.
   * @throws {Error} If the conversation is not private.
   */
  public async addMembers(newMembers: Employee[]): Promise<void> {
    // Check that the conversation is private
    if (this.privacyLevel !== PrivacyLevel.PRIVATE) {
      throw new Error(
        "Cannot add members to a non-private conversation. This conversation's privacy level is: " +
          this.privacyLevel
      );
    }

    const members: string[] = newMembers.map((member) => member.id);

    await updateDoc(this.docRef, {
      members: arrayUnion(...members),
    });
  }

  /**
   * Removes a member from the conversation.
   *
   * @param member The Employee object representing the member to remove from the conversation.
   * @throws {Error} If the conversation is not private.
   */
  public async removeMember(member: Employee): Promise<void> {
    // Check that the conversation is private
    if (this.privacyLevel !== PrivacyLevel.PRIVATE) {
      throw new Error(
        "Cannot remove members from a non-private conversation. This conversation's privacy level is: " +
          this.privacyLevel
      );
    }

    await updateDoc(this.docRef, {
      members: arrayRemove(member.id),
      muted: arrayRemove(member.id),
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
    updates: Partial<Pick<IConversation, "name" | "description">>
  ): Promise<void> {
    await updateDoc(this.docRef, updates);
  }

  /**
   * Delete the conversation.
   */
  public delete = async (): Promise<void> => await deleteDoc(this.docRef);
}
