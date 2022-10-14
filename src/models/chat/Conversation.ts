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
  PartialWithFieldValue,
} from "firebase/firestore";
import { Employee } from "models/Employee";
import { FirebaseSignature } from "../FirebaseSignature";
import { Auth } from "../../firebase";
import { PrivacyLevel } from "../../utils/PrivacyLevel";
import { PrimaryFirestore } from "../PrimaryFirestore";

export interface IConversation {
  name: string;
  description?: string;
  hosts?: string[];
  locationId: string;
  privacyLevel: PrivacyLevel;
  members: string[];
  positions?: string[];
  muted?: string[];
}

export class Conversation
  implements IConversation, PrimaryFirestore, FirebaseSignature
{
  public readonly name: string;
  public readonly description?: string;
  public readonly hosts?: string[];
  public readonly locationId: string;
  public readonly privacyLevel: PrivacyLevel;
  public readonly members: string[];
  public readonly positions?: string[];
  public readonly muted?: string[];
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly createdAt: Timestamp;
  public readonly createdBy: string;

  public static Converter = {
    toFirestore(object: Conversation): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<IConversation & FirebaseSignature>,
      options: SnapshotOptions
    ): Conversation {
      const { id, ref } = value;
      const rawData = value.data(options)!;
      return new Conversation(rawData, { id, docRef: ref });
    },
  };

  constructor(
    {
      name,
      description,
      hosts,
      locationId,
      privacyLevel,
      members,
      positions,
      muted,
      createdAt,
      createdBy,
    }: IConversation & FirebaseSignature,
    { id, docRef }: PrimaryFirestore
  ) {
    this.name = name;
    this.description = description;
    this.hosts = hosts;
    this.locationId = locationId;
    this.privacyLevel = privacyLevel;
    this.members = members;
    this.positions = positions;
    this.muted = muted;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.id = id;
    this.docRef = docRef;
  }

  public get getOrderTime() {
    return this.createdAt.toDate();
  }

  public get isMuted() {
    return this.muted.indexOf(Auth.currentUser.uid) !== -1;
  }

  public get amIhost() {
    return Boolean(this.hosts?.indexOf(Auth.currentUser.uid) > -1);
  }

  public async toggleMuteChat() {
    try {
      if (this.isMuted) {
        await updateDoc(this.docRef, {
          muted: arrayRemove(Auth.currentUser.uid),
        });
      } else {
        await updateDoc(this.docRef, {
          muted: arrayUnion(Auth.currentUser.uid),
        });
      }
    } catch (error) {
      throw error;
    }
  }

  public async addMember(addedEmployees: Employee[]) {
    if (this.privacyLevel !== PrivacyLevel.PRIVATE) {
      throw new Error("Cannot add members to public or positions chat");
    }
    try {
      await updateDoc(this.docRef, {
        members: arrayUnion(...addedEmployees.map(({ id }) => id)),
      });
    } catch (error) {
      throw error;
    }
  }

  public async removeMember(employeeId: string) {
    if (this.privacyLevel !== PrivacyLevel.PRIVATE) {
      throw new Error("Cannot remove members from public or positions chat");
    }
    try {
      await updateDoc(this.docRef, {
        members: arrayRemove(employeeId),
      });
    } catch (error) {
      throw error;
    }
  }

  public async addHost(newHost: Employee) {
    try {
      await updateDoc(this.docRef, {
        members: arrayUnion(newHost.id),
        hosts: arrayUnion(newHost.id),
      });
    } catch (error) {
      throw error;
    }
  }

  public async removeHost(host: Employee) {
    const notMember =
      this.privacyLevel === PrivacyLevel.POSITIONS &&
      !host.hasAnyPosition(this.positions);
    try {
      await updateDoc(this.docRef, {
        members: notMember && arrayRemove(host.id),
        hosts: arrayRemove(host.id),
      });
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

  public async update(
    updates: PartialWithFieldValue<
      Pick<IConversation, "name" | "description" | "positions">
    >
  ) {
    try {
      await updateDoc(this.docRef, updates);
    } catch (error) {
      throw error;
    }
  }
}
