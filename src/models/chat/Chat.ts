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
  FirestoreDataConverter,
} from "firebase/firestore";
import { PrimaryFirestore } from "../PrimaryFirestore";

export interface IChat {
  muted?: string[];
  createdAt: Timestamp;
  members: {
    [memberId: string]: { fullName: string; avatar?: string };
  };
  membersList: string[];
  recentMessage?: Timestamp;
}

export type Recipient = { id: string; fullName: string; avatar?: string };

/**
 * A Chat is a conversation between two users.
 * - A chat, (or Direct Message) is a global chat between two users independent of any location.
 * - To create a chat, you and the other user must be in the same organization.
 * @date 1/12/2022 - 18:55:36
 *
 * @export
 * @class Chat
 * @implements {IChat}
 * @implements {PrimaryFirestore}
 */
export class Chat implements IChat, PrimaryFirestore {
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  /**
   * The muted array contains the ids of users who have muted this chat.
   * @date 1/12/2022 - 18:55:58
   *
   * @public
   * @readonly
   */
  public readonly muted: string[] = [];
  public readonly createdAt: Timestamp;
  /**
   * The members object contains the ids of the users in the chat as keys.
   * @date 1/12/2022 - 18:56:19
   *
   * @public
   * @readonly
   */
  public readonly members: {
    [memberId: string]: { fullName: string; avatar?: string };
  };
  /**
   * The recentMessage timestamp is updated whenever a new message is added to the chat.
   * @date 1/12/2022 - 18:56:51
   *
   * @public
   * @readonly
   */
  public readonly recentMessage?: Timestamp;
  /**
   * Get the members list from the members object.
   * @date 1/12/2022 - 18:57:03
   *
   * @public
   * @readonly
   */
  public readonly membersList: string[];

  /**
   * This is the converter that is used to convert the data from firestore to the class.
   * @date 1/12/2022 - 18:57:15
   *
   * @public
   * @static
   * @type {FirestoreDataConverter<Chat>}
   */
  public static Converter: FirestoreDataConverter<Chat> = {
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
   * - If we have a recent message, we can use its timestamp to sort the chats.
   * - If we don't have a recent message, we can use the createdAt timestamp.
   * @date 1/12/2022 - 18:57:28
   *
   * @public
   * @readonly
   * @type {Date}
   */
  public get getOrderTime(): Date {
    return (this.recentMessage ?? this.createdAt).toDate();
  }

  /**
   * Check if the current user has muted this chat.
   * @date 1/12/2022 - 18:57:50
   *
   * @public
   * @readonly
   * @type {boolean}
   */
  public get isMuted(): boolean {
    if (!Auth.currentUser) {
      return false;
    }
    return this.muted.indexOf(Auth.currentUser.uid) !== -1;
  }

  /**
   * Get the other user in the chat.
   * - This is useful for displaying the other user's name and avatar in the chat list.
   * - This is also useful for displaying the other user's name and avatar in the chat header.
   * @date 1/12/2022 - 18:58:07
   *
   * @public
   * @readonly
   * @type {Recipient}
   */
  public get recipient(): Recipient {
    if (!Auth.currentUser) {
      // If there is no current user, we can't get the recipient.
      return {
        id: "",
        fullName: "Unknown User",
      };
    }
    const myId = Auth.currentUser.uid;
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
   * @date 1/12/2022 - 18:58:22
   *
   * @public
   * @async
   * @returns {Promise<void>}
   */
  public async toggleMuteChat(): Promise<void> {
    if (!Auth.currentUser) {
      throw new Error("You must be logged in to mute a chat.");
    }
    if (this.isMuted) {
      // If the chat is muted, we want to unmute it.
      await updateDoc(this.docRef, {
        muted: arrayRemove(Auth.currentUser.uid),
      });
    } else {
      // If the chat is not muted, we want to mute it.
      await updateDoc(this.docRef, {
        muted: arrayUnion(Auth.currentUser.uid),
      });
    }
  }
}
