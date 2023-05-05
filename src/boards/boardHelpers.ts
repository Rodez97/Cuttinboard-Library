import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  FieldValue,
  arrayUnion,
  arrayRemove,
  PartialWithFieldValue,
} from "firebase/firestore";
import {
  BoardUpdate,
  IBoard,
  IEmployee,
  PrivacyLevel,
} from "@cuttinboard-solutions/types-helpers";

export const boardConverter = {
  toFirestore(object: IBoard): DocumentData {
    const { refPath, id, ...objectToSave } = object;
    return objectToSave;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IBoard>,
    options: SnapshotOptions
  ): IBoard {
    const { id, ref } = value;
    const rawData = value.data(options);
    return {
      ...rawData,
      id,
      refPath: ref.path,
    };
  },
};

export function getUpdateBoardData(board: IBoard, updates: BoardUpdate) {
  const { position, ...data } = updates;

  let serverUpdates: PartialWithFieldValue<IBoard> = data;

  if (board.privacyLevel === PrivacyLevel.POSITIONS && position) {
    const hostsTags = board.hosts?.map((host) => `hostId_${host}`) ?? [];
    hostsTags.push(position);
    serverUpdates = { ...data, accessTags: hostsTags };
  }

  return serverUpdates;
}

export function addBoardHost(board: IBoard, newHost: IEmployee) {
  const { id: newHostId } = newHost;
  const accessTags: string[] = [];

  if (board.privacyLevel === PrivacyLevel.PRIVATE) {
    accessTags.push(newHostId);
  } else if (board.privacyLevel === PrivacyLevel.POSITIONS) {
    const newHostTag = `hostId_${newHostId}`;
    accessTags.push(newHostTag);
  }

  const serverUpdate = {
    hosts: arrayUnion(newHost.id),
    accessTags: arrayUnion(...accessTags),
  };

  return serverUpdate;
}

/**
 * Remove a host from the board.
 * @param hostId The host to remove.
 */
export function removeBoardHost(board: IBoard, hostId: string) {
  const serverUpdate: { accessTags?: FieldValue; hosts: FieldValue } = {
    hosts: arrayRemove(hostId),
  };

  if (board.hosts && !board.hosts.includes(hostId)) {
    throw new Error("Cannot remove a host that is not on the board.");
  } else if (!board.hosts) {
    throw new Error("Cannot remove a host from a board with no hosts.");
  }

  if (board.privacyLevel === PrivacyLevel.POSITIONS) {
    // If the board is position based, remove the specific access tag for the host. (hostId_<hostId>)
    const hostTag = `hostId_${hostId}`;
    serverUpdate.accessTags = arrayRemove(hostTag);
  }
  if (board.privacyLevel === PrivacyLevel.PRIVATE) {
    // If the board is private, remove the host from the access tags.
    serverUpdate.accessTags = arrayRemove(hostId);
  }
  return serverUpdate;
}

/**
 * Add new members to the board.
 * @param addedEmployees The employees to add.
 */
export function getAddMembersData(board: IBoard, addedEmployees: IEmployee[]) {
  if (board.privacyLevel !== PrivacyLevel.PRIVATE) {
    console.error("Cannot add members to a non private board.");
    return;
  }
  // Get the ids of the employees to add.
  const addedEmployeesIds = addedEmployees.map((e) => e.id);
  const serverUpdates = { accessTags: arrayUnion(...addedEmployeesIds) };

  return serverUpdates;
}

/**
 * Remove a member from the board.
 * @param memberId The member to remove.
 */
export function getRemoveMemberData(board: IBoard, memberId: string) {
  if (board.privacyLevel !== PrivacyLevel.PRIVATE) {
    console.error("Cannot remove members from a non private board.");
    return;
  }
  const serverUpdates = { accessTags: arrayRemove(memberId) };

  return serverUpdates;
}
