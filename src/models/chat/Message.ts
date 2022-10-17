import { Auth } from "../../firebase";
import { DatabaseReference, remove, update } from "firebase/database";
import { Attachment } from "./Attachment";
import { MessageContentType } from "./MessageContentType";
import { Sender } from "./Sender";
import dayjs from "dayjs";
import { ReplyRecipient } from "./ReplyRecipient";

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
 * @date 17/10/2022 - 1:00:14
 *
 * @export
 * @class Message
 * @typedef {Message}
 * @implements {IMessage}
 */
export class Message implements IMessage {
  public readonly id: string;
  public readonly messageRef: DatabaseReference;
  public message: string;
  public createdAt: number;
  public type: "attachment" | "youtube" | "mediaUri" | "text" | "system";
  public systemType: "start";
  public replyTarget?: ReplyRecipient;
  public sender: Sender;
  public reactions?: Record<string, { emoji: string; name: string }>;
  public locationName: string;
  public seenBy?: Record<string, boolean>;
  public attachment: Attachment;
  public contentType: MessageContentType;
  public sourceUrl: string;

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

  public get toReplyData(): ReplyRecipient {
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

    const object: any = {
      message,
      createdAt,
      type,
      sender,
      attachment,
      contentType,
      sourceUrl,
      id,
    };

    Object.entries(object).forEach(([key, val]) => {
      if (val === undefined) {
        delete object[key];
      }
    });

    return object;
  }

  public get createdAtDate() {
    return dayjs(this.createdAt);
  }

  public get haveUserReaction() {
    return Boolean(this.reactions?.[Auth.currentUser.uid]);
  }

  public async addReaction(emoji?: string) {
    const updates: { [key: string]: { emoji: string; name: string } | null } =
      {};
    updates[`/reactions/${Auth.currentUser.uid}`] = emoji
      ? { emoji, name: Auth.currentUser.displayName }
      : null;
    try {
      await update(this.messageRef, updates);
      if (emoji) {
        this.reactions = {
          ...this.reactions,
          [Auth.currentUser.uid]: {
            emoji,
            name: Auth.currentUser.displayName,
          },
        };
      } else {
        const newReactionsObj = this.reactions;
        delete newReactionsObj?.[Auth.currentUser.uid];
        this.reactions = newReactionsObj;
      }
    } catch (error) {
      throw error;
    }
  }

  public async updateLastVisitedBy() {
    const updates: { [key: string]: true | null } = {};
    updates[`/seenBy/${Auth.currentUser.uid}`] = true;
    try {
      await update(this.messageRef, updates);
      this.seenBy = {
        ...this.seenBy,
        [Auth.currentUser.uid]: true,
      };
    } catch (error) {
      throw error;
    }
  }

  public async delete() {
    try {
      await remove(this.messageRef);
    } catch (error) {
      throw error;
    }
  }

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
