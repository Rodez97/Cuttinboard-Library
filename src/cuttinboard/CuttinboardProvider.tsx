import React, { createContext, ReactElement, useCallback } from "react";
import { User } from "firebase/auth";
import { useCuttinboardData } from "./useCuttinboardData";
import {
  INotifications,
  IOrganizationKey,
} from "@cuttinboard-solutions/types-helpers";
import { httpsCallable } from "firebase/functions";
import { FUNCTIONS } from "../utils";

export interface ICuttinboardContext {
  user: User | null | undefined;
  organizationKey: IOrganizationKey | undefined;
  selectLocationKey: (
    organizationId: string,
    locationId: string
  ) => Promise<void>;
  onError: (error: Error) => void;
  loading: boolean;
  error: Error | undefined;
  notifications?: INotifications;
}

export const CuttinboardContext = createContext<ICuttinboardContext>(
  {} as ICuttinboardContext
);

export interface ICuttinboardProvider {
  children: ReactElement;
  /**
   * A component for rendering when there is no user.
   */
  onError: (error: Error) => void;
}

interface SelectKeyParams {
  organizationId: string;
  locationId: string;
  timestamp: number;
}

interface SelectKeyResult {
  organizationKey: IOrganizationKey;
}

export const CuttinboardProvider = ({
  children,
  onError,
}: ICuttinboardProvider) => {
  const { user, loading, organizationKey, error, notifications } =
    useCuttinboardData();

  const selectLocationKey = useCallback(
    async (organizationId: string, locationId: string) => {
      try {
        if (!user) {
          throw new Error("No user found.");
        }
        if (
          !organizationKey ||
          organizationKey.orgId !== organizationId ||
          organizationKey.locId !== locationId
        ) {
          const selectOrganizationKey = httpsCallable<
            SelectKeyParams,
            SelectKeyResult | undefined
          >(FUNCTIONS, "auth-selectkey");

          const timestamp = new Date().getTime();

          const { data } = await selectOrganizationKey({
            organizationId,
            locationId,
            timestamp,
          });

          if (!data || !data.organizationKey) {
            throw new Error("Failed to select organization key");
          }
          // Add a delay to allow the new organization key to be loaded
          await new Promise((resolve) => setTimeout(resolve, 200));
        } else {
          console.info(
            `%c User is already in organization ${organizationId} and location ${locationId}. Refreshing user.`,
            "color: green; font-weight: bold; font-size: 16px; "
          );
        }

        await user.getIdToken(true);
        // Add a delay to allow the new organization key to be loaded
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        onError(error);
        throw error;
      }
    },
    [onError, organizationKey, user]
  );

  return (
    <CuttinboardContext.Provider
      value={{
        user,
        organizationKey,
        selectLocationKey,
        onError,
        loading,
        error,
        notifications,
      }}
    >
      {children}
    </CuttinboardContext.Provider>
  );
};
