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
  /**
   * The final url of the file after it has been uploaded to cloud storage.
   */
  uri: string;
};

/**
 * Recipient of the chat.
 */
export type Recipient = { id: string; fullName: string; avatar?: string };

/**
 * The content type of the message in case it is an attachment or a mediaUri
 */
export type MessageContentType = "image" | "video" | "audio" | "file";

/**
 * Message type are used to determine how it should be rendered in the UI.
 */
export type MessageType =
  | "system"
  | "attachment"
  | "youtube"
  | "mediaUri"
  | "text";

/**
 * Reply recipient is basic information about the message that we use to reply to it.
 */
export type ReplyRecipient = Pick<
  Message,
  | "message"
  | "createdAt"
  | "type"
  | "sender"
  | "attachment"
  | "contentType"
  | "sourceUrl"
  | "id"
>;

/**
 * A Sender contains the information of the sender of a message.
 */
export type Sender = {
  id: string;
  name: string;
};
