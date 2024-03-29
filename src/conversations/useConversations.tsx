import { useContext } from "react";
import {
  ConversationsContext,
  IConversationsContextProps,
} from "./ConversationsProvider";

/**
 * A hook to get the conversations context
 * @returns The current conversations context
 */
export const useConversations = (): IConversationsContextProps => {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error(
      "useConversations must be used within a ConversationsProvider"
    );
  }
  return context;
};
