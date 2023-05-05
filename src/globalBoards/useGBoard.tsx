import { useContext } from "react";
import { GBoardContext, IGBoardContext } from "./GBoardProvider";

/**
 * A hook that returns the board context
 * @returns The Board Context
 */
export const useGBoard = (): IGBoardContext => {
  const context = useContext(GBoardContext);
  if (context === undefined) {
    throw new Error(
      "useGBoard must be used within a GBoardProvider. Wrap a parent component in <GBoardProvider> to fix this error."
    );
  }
  return context;
};
