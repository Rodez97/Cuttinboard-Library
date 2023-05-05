import { useContext } from "react";
import { BoardContext, IBoardContext } from "./BoardProvider";

/**
 * A hook that returns the board context
 * @returns The Board Context
 */
export const useBoard = (): IBoardContext => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error(
      "useBoard must be used within a BoardProvider. Wrap a parent component in <BoardProvider> to fix this error."
    );
  }
  return context;
};
