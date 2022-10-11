import {
  DocumentData,
  DocumentReference,
  FieldValue,
  Timestamp,
} from "@firebase/firestore";
import {
  arrayRemove,
  arrayUnion,
  QueryDocumentSnapshot,
  SnapshotOptions,
  updateDoc,
} from "firebase/firestore";
import { Employee } from "models/Employee";
import { Auth } from "../../firebase";
import { PrivacyLevel } from "../../utils/PrivacyLevel";
import { PrimaryFirestore } from "../PrimaryFirestore";

export const ConversationFirestoreConverter = {
  toFirestore(object: Conversation): DocumentData {
    const { docRef, id, ...objectToSave } = object;
    return objectToSave;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IConversation>,
    options: SnapshotOptions
  ): Conversation {
    const { id, ref } = value;
    const rawData = value.data(options)!;
    return new Conversation(rawData, { id, docRef: ref });
  },
};

export interface IConversation<T extends Timestamp | FieldValue = Timestamp> {
  muted?: string[];
  createdAt: T;
  locationId: string;
  members: string[];
  hostId?: string;
  name: string;
  description?: string;
  privacyLevel: PrivacyLevel;
  positions?: string[];
}

export class Conversation implements IConversation, PrimaryFirestore {
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public muted: string[] = [];
  public readonly createdAt: Timestamp;
  public readonly locationId: string;
  public readonly members: string[] = [];
  public hostId?: string;
  public name: string;
  public description?: string;
  public readonly privacyLevel: PrivacyLevel;
  public positions?: string[];

  constructor(
    {
      muted,
      members,
      createdAt,
      locationId,
      hostId,
      name,
      description,
      privacyLevel,
      positions,
    }: IConversation,
    { id, docRef }: PrimaryFirestore
  ) {
    this.id = id;
    this.docRef = docRef;
    this.muted = muted ?? [];
    this.createdAt = createdAt;
    this.members = members ?? [];
    this.locationId = locationId;
    this.positions = positions ?? [];
    this.hostId = hostId;
    this.name = name;
    this.description = description;
    this.privacyLevel = privacyLevel;
  }

  public get getOrderTime() {
    return this.createdAt.toDate();
  }

  public get isMuted() {
    return this.muted.indexOf(Auth.currentUser.uid) !== -1;
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

  public async setHost({ id }: Employee) {
    try {
      await updateDoc(this.docRef, {
        members: arrayUnion(id),
        hostId: id,
      });
    } catch (error) {
      throw error;
    }
  }

  public async removeHost(employee: Employee) {
    const notMember =
      this.privacyLevel === PrivacyLevel.POSITIONS &&
      !employee.hasAnyPosition(this.positions);
    try {
      await updateDoc(this.docRef, {
        members: notMember && arrayRemove(employee.id),
        hostId: "",
      });
    } catch (error) {
      throw error;
    }
  }
}
