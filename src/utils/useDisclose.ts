import { useReducer, useMemo } from "react";

// Define a type for the different actions that can be performed on the toggle
type DiscloseAction = {
  type: "open" | "close" | "toggle";
};

// Define a reducer function that updates the state of the toggle based on the action dispatched to it
function discloseReducer(state: boolean, action: DiscloseAction): boolean {
  switch (action.type) {
    case "open":
      // Open the toggle
      return true;
    case "close":
      // Close the toggle
      return false;
    case "toggle":
      // Toggle the state of the toggle
      return !state;
    default:
      // Return the current state if the action is not recognized
      return state;
  }
}

// Define the type of the values returned by the hook
export type DiscloseHook = [boolean, () => void, () => void, () => void];

// The useDisclose hook takes an optional initial state for the toggle, and returns an array of values
export function useDisclose(initialState = false): DiscloseHook {
  // Use the useReducer hook to manage the state of the toggle and dispatch actions to the reducer
  const [isOpen, dispatch] = useReducer(discloseReducer, initialState);

  // Define methods for opening, closing, and toggling the toggle
  const open = () => dispatch({ type: "open" });
  const close = () => dispatch({ type: "close" });
  const toggle = () => dispatch({ type: "toggle" });

  // Use the useMemo hook to memoize the array of values returned by the hook
  const resArray = useMemo<DiscloseHook>(
    () => [isOpen, open, close, toggle],
    [isOpen]
  );

  // Return the array of values
  return resArray;
}
