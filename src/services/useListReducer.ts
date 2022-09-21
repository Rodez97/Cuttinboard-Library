import { filter, findIndex, unionBy } from "lodash";
import { useReducer } from "react";
import { Message } from "../models/chat/Message";

type ReducerState = {
  error?: Error;
  loading: boolean;
  value: Message[];
};

type AddAction = {
  type: "add";
  snapshot: Message | null;
};
type ChangeAction = {
  type: "change";
  snapshot: Message | null;
};
type AppendOlderAction = {
  type: "appendOlder";
  snapshot: Message[] | null;
};
type EmptyAction = { type: "empty" };
type ErrorAction = { type: "error"; error: Error };
type RemoveAction = {
  type: "remove";
  snapshot: Message | null;
};
type ResetAction = { type: "reset" };
type ValueAction = { type: "value"; snapshots: Message[] | null };
type ReducerAction =
  | AddAction
  | ChangeAction
  | EmptyAction
  | ErrorAction
  | RemoveAction
  | ResetAction
  | ValueAction
  | AppendOlderAction;

const initialState: ReducerState = {
  loading: true,
  value: [],
};

const listReducer = (
  state: ReducerState,
  action: ReducerAction
): ReducerState => {
  switch (action.type) {
    case "add":
      if (!action.snapshot) {
        return state;
      }
      return {
        ...state,
        error: undefined,
        value: addChild(state.value, action.snapshot),
      };
    case "change":
      if (!action.snapshot) {
        return state;
      }
      return {
        ...state,
        error: undefined,
        value: changeChild(state.value, action.snapshot),
      };
    case "appendOlder":
      if (!action.snapshot) {
        return state;
      }
      return {
        ...state,
        error: undefined,
        value: appendOlder(state.value, action.snapshot),
      };
    case "error":
      return {
        ...state,
        error: action.error,
        loading: false,
        value: undefined,
      };
    case "remove":
      if (!action.snapshot) {
        return state;
      }
      return {
        ...state,
        error: undefined,
        value: removeChild(state.value, action.snapshot),
      };
    case "reset":
      return initialState;
    case "value":
      return {
        ...state,
        error: undefined,
        loading: false,
        value: setValue(action.snapshots),
      };
    case "empty":
      return {
        ...state,
        loading: false,
        value: undefined,
      };
    default:
      return state;
  }
};

const setValue = (snapshots: Message[] | null): Message[] => {
  if (!snapshots) {
    return [];
  }

  return snapshots;
};

const addChild = (currentState: Message[], newMessage: Message): Message[] => {
  if (!newMessage) {
    return currentState;
  }

  const index = currentState
    ? findIndex(currentState, ({ id }) => id === newMessage.id)
    : -1;

  if (index !== -1) {
    return changeChild(currentState, newMessage);
  } else {
    return currentState ? [...currentState, newMessage] : [newMessage];
  }
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

const changeChild = (
  currentState: Message[],
  changedMessage: Message
): Message[] => {
  if (!changedMessage) {
    return currentState;
  }
  const index = currentState
    ? findIndex(currentState, ({ id }) => id === changedMessage.id)
    : 0;
  const mutatedArray = currentState ?? [changedMessage];
  mutatedArray.splice(index, 1, changedMessage);
  return mutatedArray;
};

const removeChild = (
  currentState: Message[],
  messageToDelete: Message
): Message[] => {
  if (!messageToDelete) {
    return currentState;
  }

  if (!currentState) {
    return [];
  }

  return filter(currentState, (message) => message.id !== messageToDelete.id);
};

export default () => useReducer(listReducer, initialState);
