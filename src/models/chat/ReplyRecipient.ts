import { Message } from "./Message";

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
