import { DATABASE } from "../utils/firebase";
import { ref } from "firebase/database";
import { ObjectValHook, useObjectVal } from "react-firebase-hooks/database";
import { Notifications } from "./Notifications";

/**
 * Represents real-time data for a user.
 */
export type UserRealtimeData = {
  id: string;
  ref: string;
  metadata: {
    refreshTime: number;
    [key: string]: string | number;
  };
  notifications: Notifications;
};

/**
 * A custom hook for accessing a user's metadata in real-time.
 *
 * @param userId The ID of the user to retrieve metadata for. If `null` or `undefined`, this hook will return `undefined`.
 * @returns An array containing the user's `UserRealtimeData` object (or `undefined` if not found), a boolean indicating if the data is loading, and any errors that may have occurred.
 */
export const useUserMetadata: (
  userId: string | null | undefined
) => ObjectValHook<UserRealtimeData> = (userId) =>
  useObjectVal<UserRealtimeData>(
    userId ? ref(DATABASE, `users/${userId}`) : null,
    {
      keyField: "id",
      refField: "ref",
      transform: (props) => ({
        ...props,
        notifications: new Notifications(props?.notifications),
      }),
    }
  );
