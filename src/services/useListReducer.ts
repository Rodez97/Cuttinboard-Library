import { DatabaseReference } from "firebase/database";
import { filter, findIndex, unionBy } from "lodash";
import { useReducer } from "react";
import { IMessage, Message } from "../models/chat/Message";

type ReducerState = {
  error?: Error;
  loading: boolean;
  value: Message[];
};

type AddAction = {
  type: "add";
  snapshot: { message: IMessage; id: string; ref: DatabaseReference } | null;
};
type ChangeAction = {
  type: "change";
  snapshot: { message: IMessage; id: string } | null;
};
type AppendOlderAction = {
  type: "appendOlder";
  snapshot: Message[] | null;
};
type EmptyAction = { type: "empty" };
type ErrorAction = { type: "error"; error: Error };
type RemoveAction = {
  type: "remove";
  snapshot: string | null;
};
type ResetAction = { type: "reset" };
type ValueAction = {
  type: "value";
  snapshots: { message: IMessage; id: string; ref: DatabaseReference }[] | null;
};
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

const addChild = (
  currentState: Message[],
  newMessage: { message: IMessage; id: string; ref: DatabaseReference }
): Message[] => {
  if (!newMessage) {
    return currentState;
  }

  const index = currentState
    ? findIndex(currentState, ({ id }) => id === newMessage.id)
    : -1;

  const createMessage = new Message(
    newMessage.message,
    newMessage.id,
    newMessage.ref
  );

  if (index !== -1) {
    return changeChild(currentState, newMessage);
  } else {
    return currentState ? [...currentState, createMessage] : [createMessage];
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
  changedMessage: { message: IMessage; id: string }
): Message[] => {
  if (!changedMessage) {
    return currentState;
  }

  const message = currentState.find(
    (message) => message.id === changedMessage.id
  );

  message.stateUpdate(changedMessage.message);

  return currentState;
};

const removeChild = (
  currentState: Message[],
  messageToDelete: string
): Message[] => {
  if (!messageToDelete) {
    return currentState;
  }

  if (!currentState) {
    return [];
  }

  return filter(currentState, (message) => message.id !== messageToDelete);
};

export default () => useReducer(listReducer, initialState);
