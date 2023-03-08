import { PrivacyLevel } from "./utils/PrivacyLevel";

export type BoardCollection = "notes" | "files";

/**
 * Base interface implemented by Board class.
 */
export interface IBoard {
  name: string;
  description?: string;
  hosts?: string[];
  parentId: string;
  privacyLevel: PrivacyLevel;
  accessTags?: string[];
  global?: boolean;
  createdAt: number;
  updatedAt?: number;
  refPath: string;
  id: string;
}

/**
 * Returns the position linked to this board.
 * @remarks
 * This method will return null if the privacy level is not set to positions.
 */
export function getBoardPosition(board: IBoard) {
  if (board.privacyLevel !== PrivacyLevel.POSITIONS || !board.accessTags) {
    return null;
  }
  return board.accessTags.find(
    (at) => at !== "pl_public" && !at.startsWith("hostId_")
  );
}

export type BoardUpdate = {
  name?: string;
  description?: string;
  position?: string;
};
