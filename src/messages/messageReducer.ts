import { IMessage } from "@rodez97/types-helpers";

type Action =
  | { type: "DELETE_MESSAGE"; payload: { _id: string } }
  | { type: "SET_MESSAGE"; payload: IMessage }
  | { type: "UPDATE_MESSAGE"; payload: Partial<IMessage> & { _id: number } }
  | { type: "ADD_MESSAGES"; payload: IMessage[] }
  | { type: "APPEND_OLDER_MESSAGES"; payload: IMessage[] }
  | { type: "CLEAR_MESSAGES" }
  | { type: "ADD_MESSAGE"; payload: IMessage }
  | { type: "SET_MESSAGES"; payload: IMessage[] };

const messageReducer = (state: IMessage[] = [], action: Action): IMessage[] => {
  switch (action.type) {
    case "DELETE_MESSAGE":
      return state.filter((message) => message._id !== action.payload._id);
    case "SET_MESSAGE":
      return state.map((message) =>
        message._id === action.payload._id ? action.payload : message
      );
    case "UPDATE_MESSAGE":
      return state.map((message) =>
        message._id === action.payload._id
          ? { ...message, ...action.payload }
          : message
      );
    case "ADD_MESSAGES":
      return [...state, ...action.payload];
    case "APPEND_OLDER_MESSAGES":
      return [...action.payload, ...state];
    case "CLEAR_MESSAGES":
      return [];
    case "ADD_MESSAGE":
      return [...state, action.payload];
    case "SET_MESSAGES":
      return action.payload;
    default:
      return state;
  }
};

export default messageReducer;
