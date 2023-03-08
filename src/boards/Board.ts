import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  FieldValue,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { clone, merge, set, uniq } from "lodash";
import {
  BoardUpdate,
  getBoardPosition,
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

/**
 * Updates the board with the given data.
 * @param data The data to update.
 * @remarks
 * This method will only update the name, description, and access tags.
 */
export function getUpdateBoardData(board: IBoard, updates: BoardUpdate) {
  const { position, ...data } = updates;
  let serverUpdates;
  const localUpdates = board;
  if (
    board.privacyLevel === PrivacyLevel.POSITIONS &&
    position &&
    position !== getBoardPosition(board)
  ) {
    const hostsTags = board.hosts
      ? board.hosts.map((host) => `hostId_${host}`)
      : [];
    hostsTags.push(position);
    serverUpdates = { ...data, accessTags: hostsTags };
    merge(localUpdates, data, { accessTags: hostsTags });
  } else {
    serverUpdates = data;
    merge(localUpdates, data);
  }

  return {
    serverUpdates,
    localUpdates,
  };
}

/**
 * Add a host to the board.
 * @param newHost The new host to add.
 */
export function addBoardHost(board: IBoard, newHost: IEmployee) {
  const serverUpdate: { accessTags?: FieldValue; hosts: FieldValue } = {
    hosts: arrayUnion(newHost.id),
  };

  // Make sure that the object is extensible.
  const localUpdate: IBoard = {
    ...clone(board),
    hosts: [...(board.hosts || []), newHost.id],
  };

  if (board.privacyLevel === PrivacyLevel.POSITIONS) {
    // If the board is position based, create a specific access tag for the host. (hostId_<hostId>)
    const newHostTag = `hostId_${newHost.id}`;
    serverUpdate.accessTags = arrayUnion(newHostTag);

    if (
      localUpdate.accessTags &&
      !localUpdate.accessTags.includes(newHostTag)
    ) {
      set(localUpdate, "accessTags", [...localUpdate.accessTags, newHostTag]);
    } else if (!localUpdate.accessTags) {
      set(localUpdate, "accessTags", [newHostTag]);
    } else {
      console.error("Access tags already contains the new host tag.");
    }
  }
  if (board.privacyLevel === PrivacyLevel.PRIVATE) {
    // If the board is private, add the host to the access tags.
    serverUpdate.accessTags = arrayUnion(newHost.id);

    if (
      localUpdate.accessTags &&
      !localUpdate.accessTags.includes(newHost.id)
    ) {
      set(localUpdate, "accessTags", [...localUpdate.accessTags, newHost.id]);
    } else if (!localUpdate.accessTags) {
      set(localUpdate, "accessTags", [newHost.id]);
    } else {
      console.error("Access tags already contains the new host tag.");
    }
  }
  return { serverUpdate, localUpdate };
}

/**
 * Remove a host from the board.
 * @param hostId The host to remove.
 */
export function removeBoardHost(board: IBoard, hostId: string) {
  const serverUpdate: { accessTags?: FieldValue; hosts: FieldValue } = {
    hosts: arrayRemove(hostId),
  };
  const localUpdate: IBoard = clone(board);

  if (localUpdate.hosts && !localUpdate.hosts.includes(hostId)) {
    throw new Error("Cannot remove a host that is not on the board.");
  } else if (!localUpdate.hosts) {
    throw new Error("Cannot remove a host from a board with no hosts.");
  }

  localUpdate.hosts = localUpdate.hosts.filter((h) => h !== hostId);

  if (board.privacyLevel === PrivacyLevel.POSITIONS) {
    // If the board is position based, remove the specific access tag for the host. (hostId_<hostId>)
    const hostTag = `hostId_${hostId}`;
    serverUpdate.accessTags = arrayRemove(hostTag);
    if (localUpdate.accessTags) {
      localUpdate.accessTags = localUpdate.accessTags.filter(
        (at) => at !== hostTag
      );
    }
  }
  if (board.privacyLevel === PrivacyLevel.PRIVATE) {
    // If the board is private, remove the host from the access tags.
    serverUpdate.accessTags = arrayRemove(hostId);
    if (localUpdate.accessTags) {
      localUpdate.accessTags = localUpdate.accessTags.filter(
        (at) => at !== hostId
      );
    }
  }
  return { serverUpdate, localUpdate };
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
  const localUpdates: IBoard = {
    ...board,
    accessTags: uniq(
      board.accessTags
        ? [...board.accessTags, ...addedEmployeesIds]
        : addedEmployeesIds
    ),
  };

  return {
    serverUpdates,
    localUpdates,
  };
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
  const localUpdates: IBoard = {
    ...board,
    accessTags: board.accessTags
      ? board.accessTags.filter((at) => at !== memberId)
      : [],
  };

  return {
    serverUpdates,
    localUpdates,
  };
}
