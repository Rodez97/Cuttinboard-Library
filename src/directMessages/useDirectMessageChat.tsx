import { useContext } from "react";
import { DirectMessagesProviderContext } from "./DirectMessagesProvider";

export const useDirectMessageChat = () => {
  const context = useContext(DirectMessagesProviderContext);
  if (context === undefined) {
    throw new Error("useDMs must be used within a DMsProvider");
  }
  return context;
};
