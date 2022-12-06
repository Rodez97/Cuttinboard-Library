import { DatabaseReference } from "firebase/database";
import { unionBy } from "lodash";
import { Reducer, useReducer } from "react";
import { IMessage, Message } from "./Message";

// Define the state type for the messages array
export type MessagesState = {
  error?: Error;
  loading: boolean;
  messages: Message[];
};

type Action =
  | {
      type: "SET_VALUE";
      rawMessages:
        | { message: IMessage; id: string; ref: DatabaseReference }[]
        | null;
    }
  | {
      type: "ADD_MESSAGE";
      newMessageData: {
        message: IMessage;
        id: string;
        ref: DatabaseReference;
      } | null;
    }
  | {
      type: "UPDATE_MESSAGE";
      message: { message: IMessage; id: string } | null;
    }
  | {
      type: "REMOVE_MESSAGE";
      messageId: string;
    }
  | { type: "EMPTY" }
  | { type: "ERROR"; error: Error }
  | { type: "RESET" }
  | {
      type: "APPEND_OLDER";
      oldMessages: Message[] | null;
    };

const initialState: MessagesState = {
  loading: true,
  messages: [],
};

// Implement the reducer function
const messagesReducer: Reducer<MessagesState, Action> = (
  state: MessagesState = initialState,
  action: Action
): MessagesState => {
  switch (action.type) {
    case "ADD_MESSAGE":
      if (!action.newMessageData) {
        return state;
      }
      return {
        ...state,
        error: undefined,
        messages: addMessage(state.messages, action.newMessageData),
      };
    case "UPDATE_MESSAGE":
      if (!action.message) {
        return state;
      }
      return {
        ...state,
        error: undefined,
        messages: updateMessage(state.messages, action.message),
      };
    case "APPEND_OLDER":
      if (!action.oldMessages) {
        return state;
      }
      return {
        ...state,
        error: undefined,
        messages: appendOlder(state.messages, action.oldMessages),
      };
    case "ERROR":
      return {
        ...state,
        error: action.error,
        loading: false,
        messages: [],
      };
    case "REMOVE_MESSAGE":
      return {
        ...state,
        error: undefined,
        messages: removeMessage(state.messages, action.messageId),
      };
    case "RESET":
      return initialState;
    case "SET_VALUE":
      return {
        ...state,
        error: undefined,
        loading: false,
        messages: setValue(action.rawMessages),
      };
    case "EMPTY":
      return {
        ...state,
        loading: false,
        messages: [],
      };
    default:
      return state;
  }
};

const setValue = (
  snapshots: { message: IMessage; id: string; ref: DatabaseReference }[] | null
): Message[] => {
  if (!snapshots) {
    return [];
  }

  return snapshots.map(
    (snapshot) => new Message(snapshot.message, snapshot.id, snapshot.ref)
  );
};

const addMessage = (
  currentState: Message[],
  message: { message: IMessage; id: string; ref: DatabaseReference }
): Message[] => {
  const createMessage = new Message(message.message, message.id, message.ref);

  // Check if the message already exists in the current state
  const exists = currentState.some(({ id }) => id === message.id);

  // If the message already exists, update it
  if (exists) {
    return updateMessage(currentState, message);
  }

  return currentState ? [...currentState, createMessage] : [createMessage];
};

const updateMessage = (
  currentState: Message[],
  messageData: { message: IMessage; id: string }
): Message[] => {
  return currentState.map((message) =>
    message.id === messageData.id
      ? new Message(messageData.message, messageData.id, message.messageRef)
      : message
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
