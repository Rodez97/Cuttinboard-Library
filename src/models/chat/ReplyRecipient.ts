import { Message } from "./Message";

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
