import { ListenEvent } from "rxfire/database";
import { Message } from "./Message";

/**
 * An Attachment is a file that is attached to a message and uploaded to cloud storage.
 */
export type Attachment = {
  /**
   * The mime type of the attachment.
   */
  mimeType: string;
  /**
   * The path to the file in cloud storage.
   */
  storageSourcePath: string;
  /**
   * The name of the file.
   */
  fileName: string;
  url: string;
  contentType: MessageContentType;
};

/**
 * The content type of the message in case it is an attachment or a mediaUri
 */
export type MessageContentType = "image" | "video" | "audio" | "file";

/**
 * Reply recipient is basic information about the message that we use to reply to it.
 */
export type ReplyRecipient = Pick<
  Message,
  "text" | "createdAt" | "sender" | "attachment" | "id"
>;

/**
 * A Sender contains the information of the sender of a message.
 */
export type Sender = {
  id: string;
  name: string;
  avatar?: string | null;
};

/**
 * Recipient of the chat.
 */
export type Recipient = Sender;

export type MessageConstructorOptions =
  | {
      uploadAttachment?: (messageId: string) => Promise<Attachment>;
      isDM?: false;
    }
  | {
      uploadAttachment?: (messageId: string) => Promise<Attachment>;
      isDM: true;
      dmId: string;
    };

export type MessageStatus = "sending" | "sent" | "failed";

export type AttachmentStatus = "uploading" | "uploaded" | "failed" | "none";

export type MessageProviderMessagingType =
  | { type: "dm"; chatId: string }
  | {
      type: "conversation";
      chatId: string;
      organizationId: string;
      locationId: string;
    };

export type ChatPaths = {
  messagesPath: string;
  usersPath: string;
  storagePath: string;
};

export type MessagesReducerAction =
  | {
      type: ListenEvent.added;
      message: Message;
    }
  | {
      type: ListenEvent.changed;
      message: Message;
    }
  | {
      type: ListenEvent.removed;
      messageId: string;
    }
  | { type: "reset" }
  | {
      type: "append_older";
      oldMessages: Record<string, Message>;
    };

export type SubmitMessageParams =
  | {
      replyTargetMessage?: Message | undefined;
      messageText: string;
      uploadAttachment?:
        | ((messageId: string) => Promise<Attachment>)
        | undefined;
    }
  | {
      replyTargetMessage?: Message | undefined;
      messageText?: string | undefined;
      uploadAttachment: (messageId: string) => Promise<Attachment>;
    };
