export type ListReducerAction<T> =
  | { type: "DELETE_BY_ID"; payload: string }
  | { type: "SET_ELEMENT"; payload: T }
  | { type: "UPDATE_ELEMENT"; payload: { elementId: string; data: Partial<T> } }
  | { type: "ADD_ELEMENTS"; payload: T[] }
  | { type: "CLEAR" }
  | { type: "ADD_ELEMENT"; payload: T }
  | { type: "SET_ELEMENTS"; payload: T[] }
  | { type: "UPSERT_ELEMENTS"; payload: T[] }
  | { type: "REMOVE_ELEMENTS"; payload: T[] };

export const listReducer =
  <T>(idKey: keyof T, sorter?: (a: T, b: T) => number) =>
  (state: T[] = [], action: ListReducerAction<T>): T[] => {
    let newState: T[] = [];
    switch (action.type) {
      case "DELETE_BY_ID":
        newState = state.filter((message) => message[idKey] !== action.payload);
        break;
      case "SET_ELEMENT":
        newState = state.map((message) =>
          message[idKey] === action.payload[idKey] ? action.payload : message
        );
        break;
      case "UPDATE_ELEMENT":
        newState = state.map((message) =>
          message[idKey] === action.payload.elementId
            ? { ...message, ...action.payload.data }
            : message
        );
        break;
      case "ADD_ELEMENTS":
        newState = [...state, ...action.payload];
        break;
      case "CLEAR":
        newState = [];
        break;
      case "ADD_ELEMENT":
        newState = [...state, action.payload];
        break;
      case "SET_ELEMENTS":
        newState = action.payload;
        break;
      case "UPSERT_ELEMENTS":
        newState = action.payload.map((element) => {
          const existingElement = state.find(
            (e) => e[idKey] === element[idKey]
          );
          if (existingElement) {
            return {
              ...existingElement,
              ...element,
            };
          }
          return element;
        });
        break;
      case "REMOVE_ELEMENTS":
        newState = state.filter(
          (element) => !action.payload.some((e) => e[idKey] === element[idKey])
        );
        break;
      default:
        newState = state;
        break;
    }
    if (sorter) {
      return newState.sort(sorter);
    } else {
      return newState;
    }
  };
