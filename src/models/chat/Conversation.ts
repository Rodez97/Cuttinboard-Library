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
import { FirebaseSignature } from "../FirebaseSignature";
import { Auth } from "../../firebase";
import { PrimaryFirestore } from "../PrimaryFirestore";
import { PrivacyLevel } from "../../utils";
import { Employee } from "../Employee";

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
 * @date 1/12/2022 - 18:28:16
 *
 * @export
 * @class Conversation
 * @implements {IConversation}
 * @implements {PrimaryFirestore}
 * @implements {FirebaseSignature}
 */
export class Conversation
  implements IConversation, PrimaryFirestore, FirebaseSignature
{
  public readonly muted?: string[];
  public readonly members?: string[];
  public readonly name: string;
  public readonly description?: string;
  public readonly hosts?: string[];
  public readonly locationId: string;
  public readonly privacyLevel: PrivacyLevel;
  public readonly position?: string;
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly createdAt: Timestamp;
  public readonly createdBy: string;

  /**
   * This is the converter that is used to convert the data from firestore to the class.
   * @date 1/12/2022 - 18:29:20
   *
   * @public
   * @static
   * @type {FirestoreDataConverter<Conversation>}
   */
  public static Converter: FirestoreDataConverter<Conversation> = {
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
   * Creates an instance of Conversation.
   * @date 1/12/2022 - 18:29:37
   *
   * @constructor
   * @param {IConversation} data
   * @param {PrimaryFirestore} { id, docRef }
   */
  constructor(
    {
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
    }: IConversation & FirebaseSignature,
    { id, docRef }: PrimaryFirestore
  ) {
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
   * @date 1/12/2022 - 18:29:56
   *
   * @public
   * @readonly
   * @type {Date}
   */
  public get getOrderTime(): Date {
    return this.createdAt.toDate();
  }

  /**
   * Check if the current user is a host of this conversation.
   * @date 1/12/2022 - 18:30:25
   *
   * @public
   * @readonly
   * @type {boolean}
   */
  public get iAmHost(): boolean {
    if (!Auth.currentUser || !this.hosts) {
      return false;
    }
    return this.hosts.includes(Auth.currentUser.uid);
  }

  /**
   * Check if the current user has muted this chat.
   * @date 1/12/2022 - 18:31:02
   *
   * @public
   * @readonly
   * @type {boolean}
   */
  public get isMuted(): boolean {
    if (!Auth.currentUser || !this.muted) {
      return false;
    }
    return this.muted.includes(Auth.currentUser.uid);
  }

  /**
   * Check if the current user is a direct member of this conversation.
   * @date 1/12/2022 - 18:31:15
   *
   * @public
   * @readonly
   * @type {boolean}
   */
  public get iAmMember(): boolean {
    if (!Auth.currentUser || !this.members) {
      return false;
    }
    return this.members.includes(Auth.currentUser.uid);
  }

  /**
   * Change the muted status of the current user by adding or removing their id from the muted array.
   * @date 1/12/2022 - 18:31:29
   *
   * @public
   * @async
   * @returns {Promise<void>}
   */
  public async toggleMuteChat() {
    if (!Auth.currentUser) {
      throw new Error("You must be logged in to mute a chat.");
    }
    if (this.isMuted) {
      await updateDoc(this.docRef, {
        muted: arrayRemove(Auth.currentUser.uid),
      });
    } else {
      await updateDoc(this.docRef, {
        muted: arrayUnion(Auth.currentUser.uid),
      });
    }
  }

  /**
   * Adds a host to the conversation.
   * - The host is also added to the members array.
   * @date 1/12/2022 - 18:32:29
   *
   * @async
   * @param {Employee} newHost - The new host to add to the conversation.
   * @returns {Promise<void>}
   */
  public addHost = async (newHost: Employee): Promise<void> =>
    await updateDoc(this.docRef, {
      members: arrayUnion(newHost.id),
      hosts: arrayUnion(newHost.id),
    });

  /**
   * Removes a host from the conversation.
   * - If the host meets the membership requirements, they will remain a member.
   * @date 1/12/2022 - 18:33:49
   *
   * @public
   * @async
   * @param {Employee} host - The host to remove.
   * @returns {Promise<void>}
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
   * @date 1/12/2022 - 18:34:34
   *
   * @public
   * @async
   * @param {Employee[]} addedEmployees - The employees to add to the conversation.
   * @returns {Promise<void>}
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
   * @date 1/12/2022 - 18:35:03
   *
   * @public
   * @async
   * @param {string} memberId - The id of the member to remove.
   * @returns {Promise<void>}
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
   * @date 1/12/2022 - 18:35:27
   *
   * @public
   * @async
   * @param {(PartialWithFieldValue<
        Pick<IConversation, "name" | "description" | "position">
      >)} updates - The updates to make to the conversation.
   * @returns {Promise<void>}
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
   * @date 1/12/2022 - 18:36:17
   *
   * @async
   * @returns {Promise<void>}
   */
  public delete = async (): Promise<void> => await deleteDoc(this.docRef);
}
