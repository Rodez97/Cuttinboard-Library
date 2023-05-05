import { useReducer, useMemo } from "react";

type DiscloseAction = {
  type: "open" | "close" | "toggle";
};

/**
 * Reducer function for the `useDisclose` hook.
 * @param state - Current state of the disclosure.
 * @param action - Action object to update the state.
 * @returns - New state of the disclosure.
 */
function discloseReducer(state: boolean, action: DiscloseAction): boolean {
  switch (action.type) {
    case "open":
      return true;
    case "close":
      return false;
    case "toggle":
      return !state;
    default:
      return state;
  }
}

type DiscloseHook = [boolean, () => void, () => void, () => void];

/**
 * Custom React hook for handling disclosure state.
 * @param initialState - Initial state of the disclosure. Defaults to `false`.
 * @returns - Tuple containing the current state, open function, close function, and toggle function.
 */
export function useDisclose(initialState = false): DiscloseHook {
  const [isOpen, dispatch] = useReducer(discloseReducer, initialState);

  /**
   * Function to set the disclosure state to open.
   */
  const open = () => dispatch({ type: "open" });

  /**
   * Function to set the disclosure state to close.
   */
  const close = () => dispatch({ type: "close" });

  /**
   * Function to toggle the disclosure state.
   */
  const toggle = () => dispatch({ type: "toggle" });

  /**
   * Memoized array containing the disclosure state and its update functions.
   */
  const resArray = useMemo<DiscloseHook>(
    () => [isOpen, open, close, toggle],
    [isOpen]
  );

  return resArray;
}
