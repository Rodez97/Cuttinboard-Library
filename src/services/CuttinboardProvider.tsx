import React, {
  createContext,
  ReactElement,
  useCallback,
  useState,
} from "react";
import { IOrganizationKey } from "../account/OrganizationKey";
import { isEqual } from "lodash";
import { FUNCTIONS } from "../utils/firebase";
import { User } from "firebase/auth";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { Notifications } from "../user_metadata/Notifications";
import { useCuttinboardData } from "./useCuttinboardData";

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
  organizationKey: IOrganizationKey | null;
  /**
   * A method for selecting an organization location for the current user.
   * @param organizationId - The ID of the organization to select.
   * @param locationId - The ID of the location to select.
   * @returns A promise that resolves when the organization location has been selected.
   */
  selectOrganizationLocation: (
    organizationId: string,
    locationId: string
  ) => Promise<IOrganizationKey>;
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
        organizationKey: IOrganizationKey | null | undefined;
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
  LoadingRenderer: ReactElement;
  /**
   * A component for rendering when there is no user.
   */
  NoUserRenderer: ReactElement;
}

export const CuttinboardProvider = ({
  children,
  ErrorRenderer: ErrorComponent,
  LoadingRenderer: LoadingComponent,
  NoUserRenderer: NoUserComponent,
}: ICuttinboardProvider) => {
  const [initializing, setInitializing] = useState(true);
  const [organizationKey, setOrganizationKey] =
    useState<IOrganizationKey | null>(null);
  const [mainError, setError] = useState<Error | null>(null);
  const onUserChanged = useCallback(
    async (user: User | null) => {
      if (!user) {
        // If the user is not logged in, we don't need to load the credential
        setInitializing(false);
        setError(null);
        return;
      }

      try {
        // Load custom claims
        const tokenResult = await user.getIdTokenResult(true);
        const newOrgKey: IOrganizationKey | undefined =
          tokenResult.claims.organizationKey;

        if (!newOrgKey) {
          setOrganizationKey(null);
        } else if (!isEqual(newOrgKey, organizationKey)) {
          setOrganizationKey(newOrgKey);

          globalThis.locationData = {
            ...globalThis.locationData,
            id: newOrgKey.locId,
            role: newOrgKey.role,
            organizationId: newOrgKey.orgId,
          };
        }
        setError(null);
      } catch (error) {
        setError(error);
      } finally {
        setInitializing(false);
      }
    },
    [organizationKey]
  );
  const onRefreshTimeChanged = useCallback(
    (refreshTime: number, user: User) => {
      console.log("Refresh time changed", refreshTime);

      if (!initializing) {
        onUserChanged(user);
      }
    },
    [initializing, onUserChanged]
  );
  const { user, error, loading, notifications } = useCuttinboardData({
    onUserChanged,
    onRefreshTimeChanged,
  });
  const [selectOrganizationKey] = useHttpsCallable<
    {
      organizationId: string;
      locationId: string;
    },
    { organizationKey: IOrganizationKey } | undefined
  >(FUNCTIONS, "auth-selectKey");

  const selectOrganizationLocation = useCallback(
    async (organizationId: string, locationId: string) => {
      if (!user) {
        throw new Error("Can't select the location. User is not logged in.");
      }

      if (
        organizationKey &&
        organizationKey.orgId === organizationId &&
        organizationKey.locId === locationId
      ) {
        // If the organization key is already selected reload the user to update the custom claims
        await onUserChanged(user);
        return organizationKey;
      }

      const result = await selectOrganizationKey({
        organizationId,
        locationId,
      });
      if (!result?.data?.organizationKey) {
        throw new Error("There was an error selecting the organization key.");
      }

      // Wait 200ms to allow the user to be updated
      await new Promise((resolve) => setTimeout(resolve, 200));

      const tokenResult = await user.getIdTokenResult(true);
      const newOrgKey: IOrganizationKey | undefined =
        tokenResult.claims.organizationKey;

      if (!newOrgKey) {
        setOrganizationKey(null);
        throw new Error("The organization key is not set.");
      }

      if (!isEqual(newOrgKey, result.data.organizationKey)) {
        // If the organization key is not the same as the one returned by the function, throw an error
        throw new Error("The organization key was not set correctly.");
      }

      setOrganizationKey(newOrgKey);

      globalThis.locationData = {
        ...globalThis.locationData,
        id: locationId,
        role: newOrgKey.role,
        organizationId: organizationId,
      };

      return newOrgKey;
    },
    [user, organizationKey]
  );

  if (loading || initializing) {
    return LoadingComponent;
  }

  if (mainError) {
    return ErrorComponent(mainError);
  }

  if (error) {
    return ErrorComponent(error);
  }

  if (!user) {
    return NoUserComponent;
  }

  return (
    <CuttinboardContext.Provider
      value={{
        user,
        organizationKey,
        selectOrganizationLocation,
        notifications,
      }}
    >
      {typeof children === "function"
        ? children({
            user,
            organizationKey,
          })
        : children}
    </CuttinboardContext.Provider>
  );
};
