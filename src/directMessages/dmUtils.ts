import { IDirectMessage, Recipient } from "@rodez97/types-helpers";
import {
  arrayRemove,
  arrayUnion,
  DocumentData,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { AUTH } from "../utils/firebase";

export const dmConverter = {
  toFirestore(object: IDirectMessage): DocumentData {
    return object;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IDirectMessage>,
    options: SnapshotOptions
  ): IDirectMessage {
    return value.data(options);
  },
};

export function toggleMuteDM(dm: IDirectMessage) {
  if (!AUTH.currentUser) {
    return;
  }
  const userId = AUTH.currentUser.uid;
  const firestoreUpdates: PartialWithFieldValue<IDirectMessage> = {};
  if (checkDirectMessageMuted(dm, userId)) {
    firestoreUpdates.muted = arrayRemove(userId);
  } else {
    firestoreUpdates.muted = arrayUnion(userId);
  }

  return firestoreUpdates;
}

export const checkDirectMessageMuted = (
  directMessages: IDirectMessage,
  uid: string
): boolean => {
  if (!directMessages.muted) {
    return false;
  }
  return directMessages.muted.includes(uid);
};

export const getDirectMessageRecipient = (
  directMessages: IDirectMessage,
  uid: string
): Recipient => {
  const membersList = Object.keys(directMessages.members);
  const recipient = membersList.find((id) => id !== uid);
  if (!recipient) {
    // This should never happen.
    return {
      _id: "deleted",
      name: "Deleted User",
    };
  }
  return directMessages.members[recipient];
};

export const createDirectMessageId = (userId: string, recipientId: string) =>
  [userId, recipientId].sort().join("&");

export const getDirectMessageOrderTime = (directMessages: IDirectMessage) =>
  directMessages.recentMessage ?? directMessages.createdAt;
