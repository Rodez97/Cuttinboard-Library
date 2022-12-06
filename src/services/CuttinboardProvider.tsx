import React, {
  createContext,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useIdToken } from "react-firebase-hooks/auth";
import { IOrganizationKey, OrganizationKey } from "../account/OrganizationKey";
import { isEqual } from "lodash";
import { AUTH, FUNCTIONS } from "../utils/firebase";
import { User } from "firebase/auth";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { useUserMetadata } from "../user_metadata/useUserMetadata";
import { Notifications } from "../user_metadata/Notifications";

/**
 * The `ICuttinboardContext` interface represents the context provided by the `CuttinboardProvider` component.
 * It includes information about the current user and organization, as well as methods for selecting an organization location and accessing notifications.
 */
export interface ICuttinboardContext {
  /**
   * The current user.
   */
  user: User;
  /**
   * The organization key for the current user, if any.
   */
  organizationKey?: OrganizationKey;
  /**
   * A method for selecting an organization location for the current user.
   * @param organizationId - The ID of the organization to select.
   * @returns A promise that resolves when the organization location has been selected.
   */
  selectOrganizationLocation: (organizationId: string) => Promise<void>;
  /**
   * The notifications for the current user.
   */
  notifications: Notifications;
}

// Create the context
export const CuttinboardContext = createContext<ICuttinboardContext>(
  {} as ICuttinboardContext
);

/**
 * The `ICuttinboardProviderProps` interface represents the props for the `CuttinboardProvider` component.
 * It includes the children of the component, as well as components for rendering errors, loading, and no user.
 */
export interface ICuttinboardProvider {
  /**
   * The children of the component.
   * This can be a React element or a function that returns a React element.
   */
  children:
    | ReactElement
    | ((props: {
        user: User;
        organizationKey: OrganizationKey | null | undefined;
      }) => ReactElement);
  /**
   * A component for rendering errors.
   * @param error - The error to render.
   * @returns A React element to render the error.
   */
  ErrorRenderer: (error: Error) => ReactElement;
  /**
   * A component for rendering the loading state.
   * @param loading - A flag indicating whether the component is in the loading state.
   * @returns A React element to render the loading state.
   */
  LoadingRenderer: (loading: boolean) => ReactElement;
  /**
   * A component for rendering when there is no user.
   */
  NoUserRenderer: ReactElement;
}

/**
 * The `StateType` type represents the state of the `CuttinboardProvider` component.
 * It includes a flag indicating whether the component is initializing, the organization key for the current user, and any error that may have occurred.
 */
type StateType = {
  /**
   * A flag indicating whether the component is initializing.
   */
  initializing: boolean;
  /**
   * The organization key for the current user, if any.
   */
  organizationKey?: OrganizationKey;
  /**
   * An error that may have occurred, if any.
   */
  error?: Error | null;
};

export const CuttinboardProvider = ({
  children,
  ErrorRenderer: ErrorComponent,
  LoadingRenderer: LoadingComponent,
  NoUserRenderer: NoUserComponent,
}: ICuttinboardProvider) => {
  const [state, setState] = useState<StateType>({
    initializing: true,
  });
  const onUserChanged = useCallback(
    async (user: User) => {
      if (!user) {
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
        } = await user.getIdTokenResult();

        // If the user doesn't have an organization key or the new key is different from the current one, we need to load the credential
        if (newOrgKey && !isEqual(newOrgKey, state.organizationKey)) {
          setState({
            initializing: false,
            organizationKey: new OrganizationKey(newOrgKey),
            error: null, // Set the error to null when there is no error.
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

  const [user, loadingUser, userError] = useIdToken(AUTH, {
    onUserChanged,
  });
  const [userRealtimeData, loadingUserRealtimeData, errorRealtimeData] =
    useUserMetadata(user?.uid);
  const [selectOrganizationKey] = useHttpsCallable<
    string,
    { organizationKey: IOrganizationKey }
  >(FUNCTIONS, "auth-selectKey");

  useEffect(() => {
    user?.getIdToken(true);
  }, [userRealtimeData?.metadata?.refreshTime]);

  const selectOrganizationLocation = useCallback(
    async (organizationId: string) => {
      if (!user || state?.organizationKey?.orgId === organizationId) {
        // If the user is not logged in or the organizationId is the same as the current one, we don't need to load the credential
        if (user) {
          // Update the user's token if the user is logged in.
          await user.getIdToken(true);
        }
        return;
      }

      const result = await selectOrganizationKey(organizationId);
      if (!result || !result.data.organizationKey) {
        // If there is an error or the organization key is not found, set the error state and return.
        setState({
          initializing: false,
          error: new Error("Can't select the location."),
        });
        return;
      }
      setState({
        initializing: false,
        organizationKey: new OrganizationKey(result.data.organizationKey),
        error: null, // Set the error to null when there is no error.
      });
    },
    [state, user]
  );

  if (loadingUser || loadingUserRealtimeData || state.initializing) {
    return LoadingComponent(true);
  }

  if (userError || errorRealtimeData) {
    return ErrorComponent(userError ?? errorRealtimeData!);
  }

  if (!user) {
    return NoUserComponent;
  }

  return (
    <CuttinboardContext.Provider
      value={{
        user,
        organizationKey: state.organizationKey,
        selectOrganizationLocation,
        notifications: userRealtimeData?.notifications ?? ({} as Notifications),
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
