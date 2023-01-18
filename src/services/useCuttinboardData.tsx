import { useEffect, useState } from "react";
import { combineLatest, map, of, switchMap, tap } from "rxjs";
import { AUTH, DATABASE } from "../utils";
import { object } from "rxfire/database";
import { ref } from "firebase/database";
import { authState } from "rxfire/auth";
import { Notifications } from "../user_metadata";
import { User } from "firebase/auth";

export function useCuttinboardData(options: {
  onUserChanged: (user: User | null) => Promise<void>;
  onRefreshTimeChanged: (refreshTime: number, user: User) => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTime, setRefreshTime] = useState(0);
  const [notifications, setNotifications] = useState(new Notifications());

  useEffect(() => {
    setLoading(true);

    const user$ = authState(AUTH).pipe(
      switchMap((user) => {
        if (user && user.uid) {
          return combineLatest([
            of(user).pipe(tap(options.onUserChanged)),
            object(
              ref(DATABASE, `users/${user.uid}/metadata/refreshTime`)
            ).pipe(
              map((rt) => {
                const time: number | null = rt.snapshot.val();
                return time ?? 0;
              }),
              tap((time) => options.onRefreshTimeChanged(time, user))
            ),
            object(ref(DATABASE, `users/${user.uid}/notifications`)).pipe(
              map((notifications) => {
                const data = notifications.snapshot.val();
                return new Notifications(data);
              })
            ),
          ]);
        } else {
          setUser(null);
          setRefreshTime(0);
          setNotifications(new Notifications());
          options.onUserChanged(null);
          return of(null);
        }
      })
    );

    const subscription = user$.subscribe({
      next: (subData) => {
        if (!subData) {
          setUser(null);
          setRefreshTime(0);
          setNotifications(new Notifications());
          options.onUserChanged(null);
          return;
        }

        const [user, refreshTime, notifications] = subData;
        setUser(user);
        setRefreshTime(refreshTime);
        setNotifications(notifications);

        if (loading) {
          setLoading(false);
        }
      },
      error: (error) => {
        setError(error);
        setLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    loading,
    user,
    error,
    refreshTime,
    notifications,
  };
}
