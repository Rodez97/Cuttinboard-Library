import { IMessage } from "@cuttinboard-solutions/types-helpers";
import { Reducer, useReducer } from "react";
import { ListenEvent } from "rxfire/database";
import { MessagesReducerAction } from "./types";

const initialState: Record<string, IMessage> = {};

// Implement the reducer function
const messagesReducer: Reducer<
  Record<string, IMessage>,
  MessagesReducerAction
> = (
  state: Record<string, IMessage> = initialState,
  action: MessagesReducerAction
): Record<string, IMessage> => {
  switch (action.type) {
    case ListenEvent.added:
      return addMessage(state, action.message);
    case ListenEvent.changed:
      return updateMessage(state, action.message);
    case "append_older":
      return appendOlder(state, action.oldMessages);
    case ListenEvent.removed:
      return removeMessage(state, action.messageId);
    case "reset":
      return initialState;
    default:
      return state;
  }
};

const addMessage = (
  currentState: Record<string, IMessage>,
  message: IMessage
): Record<string, IMessage> => {
  return {
    ...currentState,
    [message.id]: message,
  };
};

const updateMessage = (
  currentState: Record<string, IMessage>,
  message: IMessage
): Record<string, IMessage> => {
  return {
    ...currentState,
    [message.id]: message,
  };
};

const removeMessage = (
  currentState: Record<string, IMessage>,
  messageId: string
): Record<string, IMessage> => {
  const { [messageId]: _, ...newState } = currentState;

  return newState;
};

const appendOlder = (
  currentState: Record<string, IMessage>,
  olderMessages: Record<string, IMessage>
): Record<string, IMessage> => {
  return {
    ...olderMessages,
    ...currentState,
  };
};

export const useListReducer = () => useReducer(messagesReducer, initialState);
