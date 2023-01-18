import { unionBy } from "lodash";
import { Reducer, useReducer } from "react";
import { Message } from "./Message";

type Action =
  | {
      type: "ADD_MESSAGE";
      newMessageData: Message | null;
    }
  | {
      type: "UPDATE_MESSAGE";
      message: Message | null;
    }
  | {
      type: "REMOVE_MESSAGE";
      messageId: string;
    }
  | { type: "RESET" }
  | {
      type: "APPEND_OLDER";
      oldMessages: Message[] | null;
    };

const initialState: Message[] = [];

// Implement the reducer function
const messagesReducer: Reducer<Message[], Action> = (
  state: Message[] = initialState,
  action: Action
): Message[] => {
  switch (action.type) {
    case "ADD_MESSAGE":
      if (!action.newMessageData) {
        return state;
      }
      return addMessage(state, action.newMessageData);
    case "UPDATE_MESSAGE":
      if (!action.message) {
        return state;
      }
      return updateMessage(state, action.message);
    case "APPEND_OLDER":
      if (!action.oldMessages) {
        return state;
      }
      return appendOlder(state, action.oldMessages);
    case "REMOVE_MESSAGE":
      return removeMessage(state, action.messageId);
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

const addMessage = (currentState: Message[], message: Message): Message[] => {
  // Check if the message already exists in the current state
  const exists = currentState.some(({ id }) => id === message.id);

  // If the message already exists, update it
  if (exists) {
    return updateMessage(currentState, message);
  }

  return currentState ? [...currentState, message] : [message];
};

const updateMessage = (
  currentState: Message[],
  messageData: Message
): Message[] => {
  if (!currentState) {
    return [];
  }
  return currentState.map((message) =>
    message.id === messageData.id ? messageData : message
  );
};

const removeMessage = (
  currentState: Message[],
  messageId: string
): Message[] => {
  if (!currentState) {
    return [];
  }

  return currentState.filter((message) => message.id !== messageId);
};

const appendOlder = (
  currentState: Message[],
  olderMessages: Message[]
): Message[] => {
  if (!olderMessages) {
    return currentState;
  }
  // Insert the item after the previous child

  return currentState
    ? unionBy(olderMessages, currentState, "id")
    : olderMessages;
};

export default () => useReducer(messagesReducer, initialState);
