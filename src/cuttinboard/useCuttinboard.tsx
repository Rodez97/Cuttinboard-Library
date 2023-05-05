import { User } from "firebase/auth";
import { useContext } from "react";
import { CuttinboardContext, ICuttinboardContext } from "./CuttinboardProvider";

/**
 * The `useCuttinboard` hook returns the `CuttinboardContext` value.
 * @returns The `ICuttinboardContext` for the current user.
 */
export const useCuttinboard = (): ICuttinboardContext & {
  user: User;
} => {
  const context = useContext(CuttinboardContext);
  if (context === undefined) {
    throw new Error("useCuttinboard must be used within a CuttinboardProvider");
  }
  if (!context.user) {
    throw new Error("No user found.");
  }

  return { ...context, user: context.user };
};

export const useCuttinboardRaw = (): ICuttinboardContext => {
  const context = useContext(CuttinboardContext);
  if (context === undefined) {
    throw new Error("useCuttinboard must be used within a CuttinboardProvider");
  }
  return context;
};
