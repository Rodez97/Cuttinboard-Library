import { useContext } from "react";
import { DirectMessageChatContext } from "./DirectMessageChatProvider";

export const useDirectMessageChat = () => {
  const context = useContext(DirectMessageChatContext);
  if (context === undefined) {
    throw new Error("useDMs must be used within a DMsProvider");
  }
  return context;
};
