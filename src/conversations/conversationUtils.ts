import {
  arrayRemove,
  arrayUnion,
  QueryDocumentSnapshot,
  SnapshotOptions,
  DocumentData,
  PartialWithFieldValue,
} from "firebase/firestore";
import { AUTH } from "../utils/firebase";
import { set, uniq } from "lodash";
import {
  checkEmployeePositions,
  IConversation,
  IEmployee,
  PrivacyLevel,
} from "@cuttinboard-solutions/types-helpers";

export const conversationConverter = {
  toFirestore(object: IConversation): DocumentData {
    const { refPath, id, ...objectToSave } = object;
    return objectToSave;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IConversation>,
    options: SnapshotOptions
  ): IConversation {
    const { id, ref } = value;
    const rawData = value.data(options);
    return {
      ...rawData,
      id,
      refPath: ref.path,
    };
  },
};

/**
 * Check if the current user is a host of this conversation.
 */
export function checkIfUserIsHost(conversation: IConversation): boolean {
  if (!AUTH.currentUser || !conversation.hosts) {
    return false;
  }
  return conversation.hosts.includes(AUTH.currentUser.uid);
}

/**
 * Check if the current user has muted this chat.
 */
export function checkConversationMuted(conversation: IConversation): boolean {
  if (!AUTH.currentUser || !conversation.muted) {
    return false;
  }
  return conversation.muted.includes(AUTH.currentUser.uid);
}

/**
 * Check if the current user is a direct member of this conversation.
 */
export function checkConversationMember(conversation: IConversation): boolean {
  if (!AUTH.currentUser || !conversation.members) {
    return false;
  }
  return conversation.members.includes(AUTH.currentUser.uid);
}

export function toggleMuteConversation(conversation: IConversation) {
  if (!AUTH.currentUser) {
    return;
  }
  const userId = AUTH.currentUser.uid;
  const serverUpdates: PartialWithFieldValue<IConversation> = {};
  const localUpdates = conversation;
  if (checkConversationMuted(conversation)) {
    serverUpdates.muted = arrayRemove(userId);
    const newMuted = conversation.muted
      ? conversation.muted.filter((memberId) => memberId !== userId)
      : [];
    set(localUpdates, "muted", newMuted);
  } else {
    serverUpdates.muted = arrayUnion(userId);
    const newMuted = conversation.muted
      ? [...conversation.muted, userId]
      : [userId];
    set(localUpdates, "muted", newMuted);
  }

  return { serverUpdates, localUpdates };
}

export function addConversationHost(
  conversation: IConversation,
  host: IEmployee
) {
  const serverUpdates: PartialWithFieldValue<IConversation> = {
    hosts: arrayUnion(host.id),
    members: arrayUnion(host.id),
  };
  const localUpdates = conversation;
  const newHosts = conversation.hosts
    ? [...conversation.hosts, host.id]
    : [host.id];
  set(localUpdates, "hosts", newHosts);

  const newMembers = conversation.members
    ? [...conversation.members, host.id]
    : [host.id];
  set(localUpdates, "members", newMembers);

  return { serverUpdates, localUpdates };
}

export function removeConversationHost(
  conversation: IConversation,
  host: IEmployee
) {
  const serverUpdates: PartialWithFieldValue<IConversation> = {
    hosts: arrayRemove(host.id),
  };
  const localUpdates = conversation;

  const newHosts = conversation.hosts
    ? conversation.hosts.filter((hostId) => hostId !== host.id)
    : [];
  set(localUpdates, "hosts", newHosts);

  if (
    (conversation.privacyLevel === PrivacyLevel.POSITIONS &&
      conversation.position &&
      !checkEmployeePositions(host, [conversation.position])) ||
    conversation.privacyLevel === PrivacyLevel.PRIVATE
  ) {
    serverUpdates.members = arrayRemove(host.id);
    serverUpdates.muted = arrayRemove(host.id);

    const newMembers = conversation.members
      ? conversation.members.filter((memberId) => memberId !== host.id)
      : [];
    set(localUpdates, "members", newMembers);

    const newMuted = conversation.muted
      ? conversation.muted.filter((memberId) => memberId !== host.id)
      : [];
    set(localUpdates, "muted", newMuted);
  }

  return { serverUpdates, localUpdates };
}

export function addConversationMembers(
  conversation: IConversation,
  newMembers: IEmployee[]
) {
  const membersIds: string[] = newMembers.map((member) => member.id);
  const serverUpdates: PartialWithFieldValue<IConversation> = {
    members: arrayUnion(...membersIds),
  };
  const localUpdates = conversation;

  const newMembersList = conversation.members
    ? [...conversation.members, ...membersIds]
    : [...membersIds];
  set(localUpdates, "members", uniq(newMembersList));

  return { serverUpdates, localUpdates };
}

export function removeConversationMembers(
  conversation: IConversation,
  membersToRemove: IEmployee[]
) {
  const membersIds: string[] = membersToRemove.map((member) => member.id);
  const serverUpdates: PartialWithFieldValue<IConversation> = {
    members: arrayRemove(...membersIds),
    muted: arrayRemove(...membersIds),
  };
  const localUpdates = conversation;

  const newMembersList = conversation.members
    ? conversation.members.filter((memberId) => !membersIds.includes(memberId))
    : [];
  set(localUpdates, "members", newMembersList);

  const newMutedList = conversation.muted
    ? conversation.muted.filter((memberId) => !membersIds.includes(memberId))
    : [];
  set(localUpdates, "muted", newMutedList);

  return { serverUpdates, localUpdates };
}
