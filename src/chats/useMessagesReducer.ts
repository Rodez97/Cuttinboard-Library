import { Reducer, useReducer } from "react";
import { ListenEvent } from "rxfire/database";
import { Message } from "./Message";
import { MessagesReducerAction } from "./types";

const initialState: Record<string, Message> = {};

// Implement the reducer function
const messagesReducer: Reducer<
  Record<string, Message>,
  MessagesReducerAction
> = (
  state: Record<string, Message> = initialState,
  action: MessagesReducerAction
): Record<string, Message> => {
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
  currentState: Record<string, Message>,
  message: Message
): Record<string, Message> => {
  return {
    ...currentState,
    [message.id]: message,
  };
};

const updateMessage = (
  currentState: Record<string, Message>,
  message: Message
): Record<string, Message> => {
  return {
    ...currentState,
    [message.id]: message,
  };
};

const removeMessage = (
  currentState: Record<string, Message>,
  messageId: string
): Record<string, Message> => {
  const { [messageId]: _, ...newState } = currentState;

  return newState;
};

const appendOlder = (
  currentState: Record<string, Message>,
  olderMessages: Record<string, Message>
): Record<string, Message> => {
  return {
    ...olderMessages,
    ...currentState,
  };
};

export const useListReducer = () => useReducer(messagesReducer, initialState);
