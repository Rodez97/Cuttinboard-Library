import { DatabaseReference, remove, update } from "firebase/database";
import dayjs from "dayjs";
import { isEmpty, pickBy } from "lodash";
import {
  Attachment,
  MessageContentType,
  ReplyRecipient,
  Sender,
} from "./types";
import { AUTH } from "../utils/firebase";

/**
 * Base interface implemented by Message class.
 */
export type IMessage<T extends number | object = number> = {
  message: string;
  createdAt: T;
  type: "system" | "attachment" | "youtube" | "mediaUri" | "text";
  systemType: "start";
  replyTarget?: ReplyRecipient;
  sender: Sender;
  reactions?: Record<string, { emoji: string; name: string }>;
  locationName: string;
  seenBy?: Record<string, boolean>;
  attachment: Attachment;
  contentType: MessageContentType;
  sourceUrl: string;
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
  public message: string;
  /**
   * The time the message was created
   */
  public createdAt: number;
  /**
   * The type of the message
   */
  public type: "attachment" | "youtube" | "mediaUri" | "text" | "system";
  /**
   * The type of the system message
   * - start: The first message of the chat
   */
  public systemType: "start";
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
  public locationName: string;
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
  public attachment: Attachment;
  /**
   * The content type of the message in case it is an attachment
   */
  public contentType: MessageContentType;
  /**
   * The source url of the attachment if it is a mediaUri
   */
  public sourceUrl: string;

  /**
   * Creates a new Message instance
   * @param messageData The message data
   * @param id The id of the message (The key of the message in Realtime Database)
   * @param ref The message reference in Realtime Database
   */
  constructor(
    {
      message,
      createdAt,
      type,
      systemType,
      replyTarget,
      sender,
      reactions,
      locationName,
      seenBy,
      attachment,
      contentType,
      sourceUrl,
    }: IMessage,
    id: string,
    ref: DatabaseReference
  ) {
    this.message = message;
    this.createdAt = createdAt;
    this.type = type;
    this.systemType = systemType;
    this.replyTarget = replyTarget;
    this.sender = sender;
    this.reactions = reactions;
    this.locationName = locationName;
    this.seenBy = seenBy;
    this.attachment = attachment;
    this.contentType = contentType;
    this.sourceUrl = sourceUrl;
    this.id = id;
    this.messageRef = ref;
  }

  /**
   * Extracts the data that we can use to reply to the message
   * - This method is used to reply to a message
   */
  public get toReplyData(): ReplyRecipient | null {
    const {
      message,
      createdAt,
      type,
      sender,
      attachment,
      contentType,
      sourceUrl,
      id,
    } = this;
    if (type === "system") {
      return null;
    }

    const object: ReplyRecipient = {
      message,
      createdAt,
      type,
      sender,
      attachment,
      contentType,
      sourceUrl,
      id,
    };

    // Remove undefined values from object
    return pickBy(object, (value) => value !== undefined) as ReplyRecipient;
  }

  /**
   * Gets the time the message was created in a dayjs instance
   */
  public get createdAtDate() {
    return dayjs(this.createdAt);
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
    message,
    createdAt,
    type,
    systemType,
    replyTarget,
    sender,
    reactions,
    locationName,
    seenBy,
    attachment,
    contentType,
    sourceUrl,
  }: IMessage) {
    this.message = message;
    this.createdAt = createdAt;
    this.type = type;
    this.systemType = systemType;
    this.replyTarget = replyTarget;
    this.sender = sender;
    this.reactions = reactions;
    this.locationName = locationName;
    this.seenBy = seenBy;
    this.attachment = attachment;
    this.contentType = contentType;
    this.sourceUrl = sourceUrl;
  }
}
