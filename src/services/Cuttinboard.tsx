import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useIdToken } from "react-firebase-hooks/auth";
import {
  IOrganizationKey,
  OrganizationKey,
} from "../models/auth/OrganizationKey";
import { isEqual } from "lodash";
import { Auth, Functions } from "../firebase";
import { User } from "firebase/auth";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { Notifications, useRealtimeData } from "./useRealtimeData";

interface ICuttinboardContext {
  user: User;
  organizationKey?: OrganizationKey;
  selectLocation: (organizationId: string) => Promise<void>;
  notifications?: Notifications;
}

const CuttinboardContext = createContext<ICuttinboardContext>(
  {} as ICuttinboardContext
);

interface CuttinboardProviderProps {
  children:
    | ReactNode
    | ((props: {
        user: User;
        organizationKey: OrganizationKey | null | undefined;
      }) => JSX.Element);
  ErrorComponent: (error: Error) => JSX.Element;
  LoadingComponent: (loading: boolean) => JSX.Element;
  NoUserComponent: JSX.Element;
}

type StateType = {
  initializing: boolean;
  organizationKey?: OrganizationKey;
  error?: Error;
};

export const CuttinboardProvider = ({
  children,
  ErrorComponent,
  LoadingComponent,
  NoUserComponent,
}: CuttinboardProviderProps) => {
  const [state, setState] = useState<StateType>({
    initializing: true,
  });
  const onUserChanged = useCallback(
    async (lUser: User) => {
      if (!lUser) {
        // If the user is not logged in, we don't need to load the credential
        setState({
          initializing: false,
        });
        return;
      }

      try {
        // Load custom claims
        const {
          claims: { organizationKey: newOrgKey },
        } = await lUser.getIdTokenResult();

        if (!newOrgKey) {
          // If the user doesn't have a organizationKey, we don't need to load the credential
          setState({
            initializing: false,
          });
        } else if (!isEqual(newOrgKey, state.organizationKey)) {
          // If the new organizationKey is different from the current one, we need to load the credential
          setState({
            initializing: false,
            organizationKey: new OrganizationKey(newOrgKey),
          });
        }
      } catch (error) {
        setState({
          initializing: false,
          error,
        });
      }
    },
    [state]
  );
  const [user, loadingUser, userError] = useIdToken(Auth, {
    onUserChanged,
  });
  const [userRealtimeData, loadingUserRealtimeData, errorRealtimeData] =
    useRealtimeData(user?.uid);
  const [selectOrganizationKey] = useHttpsCallable<
    string,
    { organizationKey: IOrganizationKey }
  >(Functions, "auth-selectKey");

  useEffect(() => {
    user?.getIdToken(true);
  }, [userRealtimeData?.metadata?.refreshTime]);

  const selectLocation = useCallback(
    async (organizationId: string) => {
      if (!user) {
        return;
      }

      if (state?.organizationKey?.orgId === organizationId) {
        // If the organizationId is the same as the current one, we don't need to load the credential but we need to update the user's token
        await user.getIdToken(true);
        return;
      }
      const result = await selectOrganizationKey(organizationId);
      if (!result || !result.data.organizationKey) {
        const error = new Error("Can't select the location.");
        setState({
          initializing: false,
          error,
        });
        return;
      }
      setState({
        initializing: false,
        organizationKey: new OrganizationKey(result.data.organizationKey),
      });
    },
    [state, user]
  );

  if (loadingUser || loadingUserRealtimeData || state.initializing) {
    return LoadingComponent(true);
  }

  if (userError || errorRealtimeData) {
    return ErrorComponent(userError ?? errorRealtimeData);
  }

  if (!user) {
    return NoUserComponent;
  }

  return (
    <CuttinboardContext.Provider
      value={{
        user,
        organizationKey: state.organizationKey,
        selectLocation,
        notifications: userRealtimeData?.notifications,
      }}
    >
      {typeof children === "function"
        ? children({
            user,
            organizationKey: state.organizationKey,
          })
        : children}
    </CuttinboardContext.Provider>
  );
};

export const useCuttinboard = () => {
  const context = useContext(CuttinboardContext);
  if (context === undefined) {
    throw new Error("useCuttinboard must be used within a CuttinboardProvider");
  }
  return context;
};
