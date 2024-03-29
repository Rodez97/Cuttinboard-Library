import { IConversation, IEmployee } from "@rodez97/types-helpers";
import {
  deleteField,
  DocumentData,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { AUTH } from "../utils/firebase";

export const conversationsConverter = {
  toFirestore(object: IConversation): DocumentData {
    return object;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IConversation>,
    options: SnapshotOptions
  ): IConversation {
    return value.data(options);
  },
};

/**
 * Check if the current user has muted this chat.
 */
export function checkConversationMuted(conversation: IConversation): boolean {
  if (!AUTH.currentUser || !conversation.members) {
    return false;
  }
  return Boolean(conversation.members[AUTH.currentUser.uid]?.muted);
}

/**
 * Check if the current user is a direct member of this conversation.
 */
export function checkConversationMember(conversation: IConversation): boolean {
  if (!AUTH.currentUser || !conversation.members) {
    return false;
  }
  return conversation.members[AUTH.currentUser.uid] !== undefined;
}

export function toggleMuteConversation(conversation: IConversation) {
  if (!AUTH.currentUser) {
    return;
  }
  const userId = AUTH.currentUser.uid;
  const firestoreUpdates: PartialWithFieldValue<IConversation> = {};
  if (checkConversationMuted(conversation)) {
    firestoreUpdates.members = {
      [userId]: {
        muted: false,
      },
    };
  } else {
    firestoreUpdates.members = {
      [userId]: {
        muted: true,
      },
    };
  }

  return firestoreUpdates;
}

export function removeConversationMembers(membersToRemove: IEmployee[]) {
  const membersIds = membersToRemove.map((member) => member.id);
  const firestoreUpdates: PartialWithFieldValue<IConversation> = {
    members: {},
  };

  membersIds.forEach((id) => {
    firestoreUpdates.members = {
      ...firestoreUpdates.members,
      [id]: deleteField(),
    };
  });

  return firestoreUpdates;
}

export function getConversationMember(
  memberId: string,
  conversation: IConversation
): IConversation["members"][string] | undefined {
  return conversation.members[memberId];
}
