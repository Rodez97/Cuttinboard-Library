import { Auth } from "../../firebase";
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  updateDoc,
  DocumentReference,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { PrimaryFirestore } from "../PrimaryFirestore";

export interface IChat {
  muted?: string[];
  createdAt: Timestamp;
  members: {
    [memberId: string]: string;
  };
  membersList: string[];
  recentMessage?: Timestamp;
}

export class Chat implements IChat, PrimaryFirestore {
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly muted: string[] = [];
  public readonly createdAt: Timestamp;
  public readonly members: {
    [memberId: string]: string;
  };
  public readonly recentMessage?: Timestamp;
  public readonly membersList: string[];

  public static Converter = {
    toFirestore(object: Chat): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<IChat>,
      options: SnapshotOptions
    ): Chat {
      const { id, ref } = value;
      const rawData = value.data(options)!;
      return new Chat(rawData, { id, docRef: ref });
    },
  };

  constructor(
    { muted, members, createdAt, recentMessage, membersList }: IChat,
    { id, docRef }: PrimaryFirestore
  ) {
    this.id = id;
    this.docRef = docRef;
    this.muted = muted ?? [];
    this.createdAt = createdAt;
    this.members = members;
    this.recentMessage = recentMessage;
    this.membersList = membersList;
  }

  /**
   * Get Order Time
   */
  public get getOrderTime() {
    return (this.recentMessage ?? this.createdAt)?.toDate();
  }

  public get isMuted() {
    return this.muted.indexOf(Auth.currentUser.uid) !== -1;
  }

  public get recipient() {
    const [id, name] = Object.entries(this.members).find(
      ([id]) => id !== Auth.currentUser.uid
    );
    return { id, name };
  }

  /**
   * Mute Chat
   */
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
}
