import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "firebase/auth";
import type {
  INotifications,
  IOrganizationKey,
} from "@cuttinboard-solutions/types-helpers";
import { AUTH, DATABASE } from "../utils/firebase";
import { ref } from "firebase/database";
import { QueryChange, object } from "rxfire/database";
import { user as listenUser } from "rxfire/auth";
import { map, merge, of, switchMap } from "rxjs";
import { isEqual } from "lodash-es";

type DataEvent =
  | (
      | { type: "user"; data: User }
      | { type: "notifications"; data: QueryChange }
    )
  | null;

export function useCuttinboardData() {
  const lastRefresh = useRef(0);
  const [organizationKey, setOrganizationKey] = useState<IOrganizationKey>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [user, setUser] = useState<User | null | undefined>();
  const [notifications, setNotifications] = useState<INotifications>({});

  const handleUser = useCallback(
    async (value: User | null) => {
      if (!value) {
        setOrganizationKey(undefined);
        setUser(null);
      } else {
        const tokenResult = await value.getIdTokenResult();
        const newOrgKey: IOrganizationKey | undefined =
          tokenResult?.claims?.organizationKey;
        if (!isEqual(newOrgKey, organizationKey)) {
          setOrganizationKey(newOrgKey);
        }
        setUser(value);
      }
    },
    [organizationKey]
  );

  const refreshToken = useCallback(
    async (refreshTime: number) => {
      if (!user) {
        return;
      }
      if (lastRefresh.current === 0) {
        lastRefresh.current = refreshTime;
        return;
      }
      if (refreshTime === lastRefresh.current) {
        return;
      }
      await user.getIdToken(true);
      lastRefresh.current = refreshTime;
    },
    [user]
  );

  useEffect(() => {
    setLoading(true);

    const user$ = listenUser(AUTH).pipe(
      switchMap((userData) => {
        if (!userData) {
          return of(null);
        }

        const userObservable = of(userData).pipe(
          map<User, DataEvent>((user) => ({ type: "user", data: user }))
        );

        const notificationsObservable = object(
          ref(DATABASE, `users/${userData.uid}/notifications`)
        ).pipe(
          map<QueryChange, DataEvent>((data) => ({
            type: "notifications",
            data,
          }))
        );

        return merge(userObservable, notificationsObservable);
      })
    );

    const subscription = user$.subscribe({
      next: (event) => {
        setLoading(false);
        if (!event) {
          handleUser(null);
          setNotifications({});
          return;
        }
        switch (event.type) {
          case "user":
            handleUser(event.data);
            break;
          case "notifications":
            {
              const notificationsData: INotifications | null =
                event.data.snapshot.val();
              const notifications = notificationsData ? notificationsData : {};
              setNotifications(notifications);
              if (notifications.claims && notifications.claims > 0) {
                refreshToken(notifications.claims);
              }
            }
            break;
        }
      },
      error: (error) => {
        setError(error);
        setLoading(false);
        handleUser(null);
        setNotifications({});
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleUser, refreshToken]);

  return {
    user,
    loading,
    error,
    notifications,
    organizationKey,
  };
}
