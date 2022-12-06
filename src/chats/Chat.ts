import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  updateDoc,
  DocumentReference,
  Timestamp,
  arrayUnion,
  arrayRemove,
  FirestoreDataConverter,
} from "firebase/firestore";
import { AUTH } from "../utils/firebase";
import { PrimaryFirestore } from "../models";
import { Recipient } from "./types";

/**
 * Chat interface implemented by the Chat class.
 */
export interface IChat {
  muted?: string[];
  createdAt: Timestamp;
  members: {
    [memberId: string]: { fullName: string; avatar?: string };
  };
  membersList: string[];
  recentMessage?: Timestamp;
}

/**
 * A Chat is a conversation between two users.
 * - A chat, (or Direct Message) is a global chat between two users independent of any location.
 * - To create a chat, you and the other user must be in the same organization.
 */
export class Chat implements IChat, PrimaryFirestore {
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
  public readonly muted: string[] = [];
  /**
   * The timestamp of when the chat was created.
   */
  public readonly createdAt: Timestamp;
  /**
   * The members of the chat.
   */
  public readonly members: Record<string, Omit<Recipient, "id">>;
  /**
   * The recentMessage timestamp is updated whenever a new message is added to the chat.
   */
  public readonly recentMessage?: Timestamp;
  /**
   * The membersList is an array of the ids of the members of the chat.
   */
  public readonly membersList: string[];

  /**
   * Convert a QueryDocumentSnapshot to a Chat instance.
   */
  public static firestoreConverter: FirestoreDataConverter<Chat> = {
    toFirestore(object: Chat): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<IChat>,
      options: SnapshotOptions
    ): Chat {
      const { id, ref } = value;
      const rawData = value.data(options);
      return new Chat(rawData, { id, docRef: ref });
    },
  };

  /**
   * Creates an instance of Chat.
   * @param data - The data of the chat.
   * @param firestoreBase - The firestore base of the chat.
   */
  constructor(data: IChat, firestoreBase: PrimaryFirestore) {
    const { muted, members, createdAt, recentMessage, membersList } = data;
    const { id, docRef } = firestoreBase;

    this.id = id;
    this.docRef = docRef;
    this.muted = muted ?? [];
    this.createdAt = createdAt;
    this.members = members;
    this.recentMessage = recentMessage;
    this.membersList = membersList;
  }

  /**
   * - If we have a recent message, we can use its timestamp to sort the chats.
   * - If we don't have a recent message, we can use the createdAt timestamp.
   */
  public get getOrderTime(): Date {
    return (this.recentMessage ?? this.createdAt).toDate();
  }

  /**
   * Check if the current user has muted this chat.
   */
  public get isMuted(): boolean {
    if (!AUTH.currentUser) {
      return false;
    }
    return this.muted.indexOf(AUTH.currentUser.uid) !== -1;
  }

  /**
   * Get the other user in the chat.
   * - This is useful for displaying the other user's name and avatar in the chat list.
   * - This is also useful for displaying the other user's name and avatar in the chat header.
   */
  public get recipient(): Recipient {
    if (!AUTH.currentUser) {
      // If there is no current user, we can't get the recipient.
      return {
        id: "",
        fullName: "Unknown User",
      };
    }
    const myId = AUTH.currentUser.uid;
    const recipient = Object.entries(this.members).find(([id]) => id !== myId);
    if (!recipient) {
      // This should never happen.
      return {
        id: "",
        fullName: "Unknown User",
      };
    }
    return {
      id: recipient[0],
      ...recipient[1],
    };
  }

  /**
   * Change the muted status of the current user by adding or removing their id from the muted array.
   */
  public async toggleMuteChat(): Promise<void> {
    if (!AUTH.currentUser) {
      throw new Error("You must be logged in to mute a chat.");
    }
    if (this.isMuted) {
      // If the chat is muted, we want to unmute it.
      await updateDoc(this.docRef, {
        muted: arrayRemove(AUTH.currentUser.uid),
      });
    } else {
      // If the chat is not muted, we want to mute it.
      await updateDoc(this.docRef, {
        muted: arrayUnion(AUTH.currentUser.uid),
      });
    }
  }
}
