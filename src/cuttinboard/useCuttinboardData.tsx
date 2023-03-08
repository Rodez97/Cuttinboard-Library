import { useEffect, useState, useCallback } from "react";
import { combineLatest, map, of, switchMap } from "rxjs";
import { AUTH, DATABASE } from "../utils";
import { object, QueryChange } from "rxfire/database";
import { authState } from "rxfire/auth";
import {
  setCuttinboardError,
  updateRefreshTimeThunk,
} from "./cuttinboard.slice";
import { useAppDispatch, useAppThunkDispatch } from "../reduxStore/utils";
import { setNotifications } from "../notifications/notifications.slice";
import { User } from "firebase/auth";
import { INotifications } from "@cuttinboard-solutions/types-helpers";
import { ref } from "firebase/database";

type UserData =
  | [
      User,
      {
        time: number;
        notifications: INotifications;
      }
    ]
  | null;

function extractUserData(userRealtimeData: QueryChange) {
  // Get the refresh time from the user's metadata
  const time: number =
    userRealtimeData.snapshot.child("metadata/refreshTime").val() || 0;

  // Get the notifications from the user's data
  const notifications: INotifications =
    userRealtimeData.snapshot.child("notifications").val() || {};

  return { time, notifications };
}

export function useCuttinboardData({
  onError,
}: {
  onError: (err: Error) => void;
}) {
  const dispatch = useAppDispatch();
  const thunkDispatch = useAppThunkDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleData = useCallback(
    (data: UserData) => {
      if (!data) {
        setUser(null);
        dispatch({ type: "RESET" });
      } else {
        const [user, { time, notifications }] = data;
        setUser(user);
        dispatch(setNotifications(notifications));
        thunkDispatch(updateRefreshTimeThunk(time, user));
      }

      setLoading(false);
    },
    [dispatch, thunkDispatch]
  );

  const handleError = useCallback(
    (error: Error) => {
      onError(error);
      dispatch(setCuttinboardError(error.message ?? "Unknown error"));
    },
    [dispatch, onError]
  );

  useEffect(() => {
    setLoading(true);

    const user$ = authState(AUTH).pipe(
      switchMap((user) => {
        if (user) {
          return combineLatest([
            of(user),
            object(ref(DATABASE, `users/${user.uid}`)).pipe(
              map(extractUserData)
            ),
          ]);
        } else {
          return of(null);
        }
      })
    );

    const subscription = user$.subscribe({
      error: handleError,
      next: handleData,
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, thunkDispatch, onError, handleData, handleError]);

  return { user, loading };
}
