import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
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

  if (board.details.privacyLevel === PrivacyLevel.POSITIONS && position) {
    serverUpdates = { ...data, details: { position } };
  }

  return serverUpdates;
}

export function addBoardHost(newHost: IEmployee) {
  const serverUpdate: PartialWithFieldValue<IBoard> = {
    details: {
      admins: arrayUnion(newHost.id),
    },
  };

  return serverUpdate;
}

/**
 * Remove a host from the board.
 * @param hostId The host to remove.
 */
export function removeBoardHost(hostId: string) {
  const serverUpdate: PartialWithFieldValue<IBoard> = {
    details: {
      admins: arrayRemove(hostId),
    },
  };

  return serverUpdate;
}

/**
 * Add new members to the board.
 * @param addedEmployees The employees to add.
 */
export function getAddMembersData(board: IBoard, addedEmployees: IEmployee[]) {
  if (board.details.privacyLevel !== PrivacyLevel.PRIVATE) {
    console.error("Cannot add members to a non private board.");
    return;
  }
  // Get the ids of the employees to add.
  const addedEmployeesIds = addedEmployees.map((e) => e.id);
  const serverUpdates: PartialWithFieldValue<IBoard> = {
    details: { members: arrayUnion(...addedEmployeesIds) },
  };

  return serverUpdates;
}

/**
 * Remove a member from the board.
 * @param memberId The member to remove.
 */
export function getRemoveMemberData(board: IBoard, memberId: string) {
  if (board.details.privacyLevel !== PrivacyLevel.PRIVATE) {
    console.error("Cannot remove members from a non private board.");
    return;
  }
  const serverUpdates: PartialWithFieldValue<IBoard> = {
    details: { members: arrayRemove(memberId) },
  };

  return serverUpdates;
}
