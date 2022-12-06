import { useContext } from "react";
import { CuttinboardContext } from "./CuttinboardProvider";

/**
 * The `useCuttinboard` hook returns the `CuttinboardContext` value.
 * @returns The `ICuttinboardContext` for the current user.
 */

export const useCuttinboard = () => {
  const context = useContext(CuttinboardContext);
  if (context === undefined) {
    throw new Error("useCuttinboard must be used within a CuttinboardProvider");
  }
  return context;
};
