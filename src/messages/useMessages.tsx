import { useContext } from "react";
import { IMessagesContext, MessagesContext } from "./MessagesProvider";

export const useMessages = (): IMessagesContext => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
};
