import {
  DatabaseReference,
  remove,
  set,
  update,
  serverTimestamp as DBServerTimestamp,
} from "firebase/database";
import dayjs from "dayjs";
import { isEmpty, isFunction, isUndefined, omitBy, pickBy } from "lodash";
import {
  Attachment,
  AttachmentStatus,
  MessageConstructorOptions,
  MessageStatus,
  ReplyRecipient,
  Sender,
} from "./types";
import { AUTH, FIRESTORE } from "../utils/firebase";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { ParsedMedia, parseMediaFromText } from "./messageUtils";

/**
 * Base interface implemented by Message class.
 */
export type IMessage = {
  sender: Sender;
  createdAt: number;
  text?: string;
  systemType?: "start" | "other";
  replyTarget?: ReplyRecipient;
  reactions?: Record<string, { emoji: string; name: string }>;
  locationName?: string;
  seenBy?: Record<string, boolean>;
  attachment?: Attachment;
};

/**
 * Chat Message
 */
export class Message implements IMessage {
  /**
   * The Id of the message
   */
  public readonly id: string;
  /**
   * The message reference in Realtime Database
   */
  public readonly messageRef: DatabaseReference;
  /**
   * Message content
   */
  public text?: string;
  /**
   * The time the message was created
   */
  public createdAt: number;
  /**
   * The type of the system message
   * - start: The first message of the chat
   */
  public systemType?: "start" | "other";
  /**
   * In case the message is a reply to another message, this property will contain the message that is being replied to.
   */
  public replyTarget?: ReplyRecipient;
  /**
   * The sender of the message
   */
  public sender: Sender;
  /**
   * Emoji reactions to the message
   * - key: The user id of the user that reacted
   * - value: The emoji that the user reacted with and the name of the user
   * @example
   * {
   *  "123qwerty": { emoji: "👍", name: "John Doe"},
   * }
   */
  public reactions?: Record<string, { emoji: string; name: string }>;
  /**
   * The name of the location
   * - This property is only used for notification purposes
   */
  public locationName?: string;
  /**
   * The users that have seen the message
   * - key: The user id of the user that has seen the message
   * - value: true
   * @example
   * {
   *  "123qwerty": true,
   * }
   * @remarks
   * This property is only used in 1-on-1 chats
   */
  public seenBy?: Record<string, boolean>;
  /**
   * The attachment of the message (if any)
   */
  public attachment?: Attachment;

  private _status: MessageStatus = "sending";

  public get status(): MessageStatus {
    return this._status;
  }
  private set status(value: MessageStatus) {
    this._status = value;
  }
  private _attachmentStatus: AttachmentStatus = "none";

  public get attachmentStatus(): AttachmentStatus {
    return this._attachmentStatus;
  }
  private set attachmentStatus(value: AttachmentStatus) {
    this._attachmentStatus = value;
  }

  /**
   * Creates a new Message instance
   * @param messageData The message data
   * @param id The id of the message (The key of the message in Realtime Database)
   * @param ref The message reference in Realtime Database
   */
  constructor(
    {
      text,
      createdAt,
      systemType,
      replyTarget,
      sender,
      reactions,
      locationName,
      seenBy,
      attachment,
    }: IMessage,
    id: string,
    ref: DatabaseReference,
    options?: MessageConstructorOptions
  ) {
    this.text = text;
    this.createdAt = createdAt;
    this.systemType = systemType;
    this.replyTarget = replyTarget;
    this.sender = sender;
    this.reactions = reactions;
    this.locationName = locationName;
    this.seenBy = seenBy;
    this.attachment = attachment;
    this.id = id;
    this.messageRef = ref;

    if (options) {
      this.status = "sending";
      this.attachmentStatus = "none";
      this.processMessage(options);
    }
  }

  private async processMessage(options: MessageConstructorOptions) {
    this.status = "sending";
    try {
      // If there is an attachment callback, upload the attachment
      if (options.uploadAttachment) {
        this.attachmentStatus = "uploading";
        const attachment = await options.uploadAttachment(this.id);
        this.attachment = attachment;
        this.attachmentStatus = "uploaded";
      }

      // Set to Realtime Database
      const { createdAt, messageRef, status, ...messageData } = this;
      await set(messageRef, {
        ...omitBy(
          messageData,
          (value) => isUndefined(value) || isFunction(value)
        ),
        createdAt: DBServerTimestamp(),
        status: "sent",
      });

      if (options.isDM) {
        await updateDoc(doc(FIRESTORE, "DirectMessages", options.dmId), {
          recentMessage: serverTimestamp(),
        });
      }
    } catch (error) {
      this.status = "failed";
      this.attachmentStatus = "failed";
      console.error(error);
      return;
    }
  }

  /**
   * Extracts the data that we can use to reply to the message
   * - This method is used to reply to a message
   */
  public get toReplyData(): ReplyRecipient | null {
    const { text, createdAt, sender, attachment, id } = this;
    if (this.systemType !== undefined) {
      return null;
    }

    // Remove undefined values from object
    return pickBy(
      {
        text,
        createdAt,
        sender,
        attachment,
        id,
      },
      (value) => value !== undefined
    ) as ReplyRecipient;
  }

  /**
   * Gets the time the message was created in a dayjs instance
   */
  public get createdAtDate() {
    return dayjs(this.createdAt);
  }

  public get parsedMedia(): ParsedMedia[] | null {
    if (!this.text) {
      return null;
    }
    return parseMediaFromText(this.text);
  }

  public get dmReceived() {
    if (!this.seenBy) {
      return false;
    }
    const seenBy = Object.values(this.seenBy);
    return seenBy.length === 2 && seenBy.every((value) => value);
  }

  /**
   * Check if the message has user reactions
   */
  public get haveUserReaction() {
    if (!AUTH.currentUser || !this.reactions || isEmpty(this.reactions)) {
      return false;
    }
    return Boolean(this.reactions[AUTH.currentUser.uid]);
  }

  /**
   * Adds a reaction to the message
   * @param emoji The emoji to react with (e.g. "👍") (max 1 emoji)
   * @remarks
   * To remove a reaction, pass `undefined` as the emoji parameter or don't pass any parameter
   */
  public async addReaction(emoji?: string) {
    if (!AUTH.currentUser || !AUTH.currentUser.displayName) {
      throw new Error("User is not authenticated");
    }
    const updates: { [key: string]: { emoji: string; name: string } | null } =
      {};
    updates[`/reactions/${AUTH.currentUser.uid}`] = emoji
      ? { emoji, name: AUTH.currentUser.displayName }
      : null;
    await update(this.messageRef, updates);
    if (emoji) {
      this.reactions = {
        ...this.reactions,
        [AUTH.currentUser.uid]: {
          emoji,
          name: AUTH.currentUser.displayName,
        },
      };
    } else {
      const newReactionsObj = this.reactions;
      delete newReactionsObj?.[AUTH.currentUser.uid];
      this.reactions = newReactionsObj;
    }
  }

  /**
   * Updates the user that has seen the message
   * @remarks
   * This method is only used in 1-on-1 chats
   */
  public async updateLastVisitedBy() {
    if (!AUTH.currentUser) {
      throw new Error("User is not authenticated");
    }
    const updates: { [key: string]: true | null } = {};
    updates[`/seenBy/${AUTH.currentUser.uid}`] = true;
    await update(this.messageRef, updates);
    this.seenBy = {
      ...this.seenBy,
      [AUTH.currentUser.uid]: true,
    };
  }

  public getSeenDBPath() {
    if (!AUTH.currentUser) {
      throw new Error("User is not authenticated");
    }
    return `${this.messageRef.toString()}/seenBy/${AUTH.currentUser.uid}`;
  }

  /**
   * Deletes the message
   */
  public async delete() {
    await remove(this.messageRef);
  }

  /**
   * Updates the content of the message (Used when a message is edited from the database)
   * @param newState The new state of the message
   * @remarks
   * This method is used internally
   */
  public stateUpdate({
    text,
    createdAt,
    systemType,
    replyTarget,
    sender,
    reactions,
    locationName,
    seenBy,
    attachment,
  }: IMessage) {
    this.text = text;
    this.createdAt = createdAt;
    this.systemType = systemType;
    this.replyTarget = replyTarget;
    this.sender = sender;
    this.reactions = reactions;
    this.locationName = locationName;
    this.seenBy = seenBy;
    this.attachment = attachment;
  }
}
