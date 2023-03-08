import React, {
  createContext,
  ReactElement,
  useCallback,
  useMemo,
} from "react";
import { User } from "firebase/auth";
import { useCuttinboardData } from "./useCuttinboardData";
import {
  refreshUserThunk,
  selectCuttinboardError,
  selectCuttinboardRefreshingUser,
  selectLocationThunk,
  selectOrganizationKey,
} from "./cuttinboard.slice";
import { useAppSelector, useAppThunkDispatch } from "../reduxStore/utils";
import { IOrganizationKey } from "@cuttinboard-solutions/types-helpers";

export interface ICuttinboardContext {
  user: User | null | undefined;
  organizationKey: IOrganizationKey | null | undefined;
  selectLocationKey: (
    organizationId: string,
    locationId: string
  ) => Promise<void>;
  refreshUser: () => void;
  refreshingUser: boolean;
  onError: (error: Error) => void;
  loading: boolean;
  error: string | undefined;
}

export const CuttinboardContext = createContext<ICuttinboardContext>(
  {} as ICuttinboardContext
);

export interface ICuttinboardProvider {
  children: ReactElement | ((props: ICuttinboardContext) => ReactElement);
  /**
   * A component for rendering when there is no user.
   */
  onError: (error: Error) => void;
}

export const CuttinboardProvider = ({
  children,
  onError,
}: ICuttinboardProvider) => {
  const thunkDispatch = useAppThunkDispatch();
  const refreshingUser = useAppSelector(selectCuttinboardRefreshingUser);
  const error = useAppSelector(selectCuttinboardError);
  const organizationKey = useAppSelector(selectOrganizationKey);
  const { user, loading } = useCuttinboardData({ onError });

  const selectLocationKey = useCallback(
    (organizationId: string, locationId: string) => {
      if (!user) {
        throw new Error("No user found.");
      }
      return thunkDispatch(
        selectLocationThunk(organizationId, locationId, user)
      );
    },
    [thunkDispatch, user]
  );

  const refreshUser = useCallback(() => {
    if (!user) {
      throw new Error("No user found.");
    }
    thunkDispatch(refreshUserThunk(user)).catch(onError);
  }, [thunkDispatch, user]);

  const value = useMemo(
    () => ({
      user,
      organizationKey,
      selectLocationKey,
      refreshUser,
      refreshingUser,
      onError,
      loading,
      error,
    }),
    [
      user,
      organizationKey,
      selectLocationKey,
      refreshUser,
      refreshingUser,
      onError,
      loading,
      error,
    ]
  );

  return (
    <CuttinboardContext.Provider value={value}>
      {typeof children === "function" ? children(value) : children}
    </CuttinboardContext.Provider>
  );
};
