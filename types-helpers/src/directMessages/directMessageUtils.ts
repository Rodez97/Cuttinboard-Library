import { Recipient } from "../message";
import { IDirectMessage } from "./IDirectMessage";

export const createDMId = (userId: string, recipientId: string) =>
  [userId, recipientId].sort().join("&");

/**
 * - If we have a recent message, we can use its timestamp to sort the chats.
 * - If we don't have a recent message, we can use the createdAt timestamp.
 */
export function getDmOrderTime(directMessages: IDirectMessage): number {
  return directMessages.recentMessage ?? directMessages.createdAt;
}

/**
 * Check if the current user has muted this chat.
 */
export function checkDmMuted(
  directMessages: IDirectMessage,
  uid: string
): boolean {
  if (!directMessages.muted) {
    return false;
  }
  return directMessages.muted.includes(uid);
}

/**
 * Get the other user in the chat.
 * - This is useful for displaying the other user's name and avatar in the chat list.
 * - This is also useful for displaying the other user's name and avatar in the chat header.
 */
export function getDmRecipient(
  directMessages: IDirectMessage,
  uid: string
): Recipient {
  const recipient = directMessages.membersList.find((id) => id !== uid);
  if (!recipient) {
    // This should never happen.
    return {
      id: "",
      name: "Unknown User",
    };
  }
  return directMessages.members[recipient];
}
