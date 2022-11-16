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
      muted,
      createdAt,
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

  public get getOrderTime() {
    return this.createdAt.toDate();
  }

  public get iAmHost() {
    return Boolean(this.hosts?.includes(Auth.currentUser.uid));
  }

  public get isMuted() {
    return Boolean(this.muted?.includes(Auth.currentUser.uid));
  }

  public get iAmMember() {
    return Boolean(this.members?.includes(Auth.currentUser.uid));
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

  public addHost = async (newHost: Employee) =>
    await updateDoc(this.docRef, {
      members: arrayUnion(newHost.id),
      hosts: arrayUnion(newHost.id),
    });

  public async removeHost(host: Employee) {
    try {
      const hostUpdate: { members?: FieldValue; hosts: FieldValue } = {
        hosts: arrayRemove(host.id),
      };
      if (this.privacyLevel === PrivacyLevel.POSITIONS) {
        // Check if the host also has the position
        const hasPosition = host.hasAnyPosition([this.position]);

        if (!hasPosition) {
          // If not, remove from members
          hostUpdate.members = arrayRemove(host.id);
        }
      }
      if (this.privacyLevel === PrivacyLevel.PRIVATE) {
        hostUpdate.members = arrayRemove(host.id);
      }
      await updateDoc(this.docRef, hostUpdate);
    } catch (error) {
      throw error;
    }
  }

  public async addMembers(addedEmployees: Employee[]) {
    if (this.privacyLevel !== PrivacyLevel.PRIVATE) {
      // If the conversation is not private, we don't need to add members
      throw new Error("Cannot add members to a non-private conversation");
    }
    try {
      const members = addedEmployees.map((employee) => employee.id);
      await updateDoc(this.docRef, {
        members: arrayUnion(...members),
      });
    } catch (error) {
      throw error;
    }
  }

  public async removeMember(memberId: string) {
    if (this.privacyLevel !== PrivacyLevel.PRIVATE) {
      // If the conversation is not private, we don't need to remove members
      throw new Error("Cannot remove members from a non-private conversation");
    }
    try {
      await updateDoc(this.docRef, {
        members: arrayRemove(memberId),
      });
    } catch (error) {
      throw error;
    }
  }

  public async update(
    updates: PartialWithFieldValue<
      Pick<IConversation, "name" | "description" | "position" | "members">
    >
  ) {
    try {
      await updateDoc(this.docRef, updates);
    } catch (error) {
      throw error;
    }
  }

  public delete = async () => await deleteDoc(this.docRef);
}
