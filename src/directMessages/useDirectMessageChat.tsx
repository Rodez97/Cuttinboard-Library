import { useContext } from "react";
import {
  DirectMessagesContext,
  DirectMessagesProviderContext,
} from "./DirectMessagesProvider";

export const useDirectMessageChat = (): DirectMessagesContext => {
  const context = useContext(DirectMessagesProviderContext);
  if (context === undefined) {
    throw new Error("useDMs must be used within a DMsProvider");
  }
  return context;
};
