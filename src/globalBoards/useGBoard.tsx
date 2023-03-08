import { useContext } from "react";
import { GBoardContext } from "./GBoardProvider";

/**
 * A hook that returns the board context
 * @returns The Board Context
 */
export const useGBoard = () => {
  const context = useContext(GBoardContext);
  if (context === undefined) {
    throw new Error(
      "useGBoard must be used within a GBoardProvider. Wrap a parent component in <GBoardProvider> to fix this error."
    );
  }
  return context;
};
