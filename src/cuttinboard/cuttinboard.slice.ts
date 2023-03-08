import {
  AnyAction,
  createAsyncThunk,
  createSlice,
  PayloadAction,
  Reducer,
  ThunkDispatch,
} from "@reduxjs/toolkit";
import { httpsCallable } from "firebase/functions";
import { FUNCTIONS } from "../utils";
import { AppThunk, RootState } from "../reduxStore/utils";
import { User } from "firebase/auth";
import { IOrganizationKey } from "@cuttinboard-solutions/types-helpers";
import { LoadingStatus } from "../models";

interface SelectKeyParams {
  organizationId: string;
  locationId: string;
}

interface SelectKeyResult {
  organizationKey: IOrganizationKey;
}

async function selectNewOrganizationKey(
  organizationId: string,
  locationId: string
): Promise<IOrganizationKey> {
  const selectOrganizationKey = httpsCallable<
    SelectKeyParams,
    SelectKeyResult | undefined
  >(FUNCTIONS, "auth-selectKey");

  try {
    const { data } = await selectOrganizationKey({
      organizationId,
      locationId,
    });

    if (!data || !data.organizationKey) {
      throw new Error("Failed to select organization key");
    }

    return data.organizationKey;
  } catch (error) {
    console.error("Error selecting organization key:", error);
    throw error;
  }
}

const getUserOrganizationKey = async (user: User) => {
  try {
    const tokenResult = await user.getIdTokenResult(true);
    const newOrgKey: IOrganizationKey | undefined =
      tokenResult?.claims?.organizationKey;

    return newOrgKey;
  } catch (error) {
    console.error("Error getting user organization key:", error);
    throw error;
  }
};

export interface CuttinboardState extends LoadingStatus {
  organizationKey?: IOrganizationKey | null | undefined;
  refreshTime: number;
  refreshingUser: boolean;
}

export const selectLocationThunk =
  (
    organizationId: string,
    locationId: string,
    user: User
  ): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState();
    const currentKey = selectOrganizationKey(state);

    if (
      !currentKey ||
      currentKey.orgId !== organizationId ||
      currentKey.locId !== locationId
    ) {
      await selectNewOrganizationKey(organizationId, locationId);
      // Add a delay to allow the new organization key to be loaded
      await new Promise((resolve) => setTimeout(resolve, 300));
    } else {
      console.info(
        `%c User is already in organization ${organizationId} and location ${locationId}. Refreshing user.`,
        "color: green; font-weight: bold; font-size: 16px; "
      );
    }

    const newOrgKey = await getUserOrganizationKey(user);

    if (!newOrgKey) {
      throw new Error("There was an error selecting the organization key.");
    }

    dispatch(upsertKey(newOrgKey));
  };

export const refreshUserThunk = createAsyncThunk<
  IOrganizationKey | undefined,
  User,
  {
    state: RootState;
    dispatch: ThunkDispatch<RootState, void, AnyAction>;
    rejectValue: Error;
  }
>("cuttinboard/refreshUser", async (user, { dispatch }) => {
  const newOrgKey = await getUserOrganizationKey(user);

  dispatch(upsertKey(newOrgKey));

  return newOrgKey;
});

export const updateRefreshTimeThunk =
  (newTime: number, user: User): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState();
    const prevTime = state.cuttinboard.refreshTime;

    if (prevTime === newTime) {
      return;
    }

    dispatch(updateUserRefreshTime(newTime));

    dispatch(refreshUserThunk(user));
  };

const initialState: CuttinboardState = {
  organizationKey: null,
  refreshTime: 0,
  refreshingUser: false,
  loading: "idle",
};

const cuttinboardSlice = createSlice({
  name: "cuttinboard",
  initialState,
  reducers: {
    upsertKey(
      state,
      action: PayloadAction<IOrganizationKey | null | undefined>
    ) {
      if (state.loading === "failed") {
        state.error = undefined;
      }
      state.loading = "succeeded";
      state.organizationKey = action.payload;
    },
    updateUserRefreshTime(state, action: PayloadAction<number>) {
      state.refreshTime = action.payload;
    },
    setCuttinboardError(state, action: PayloadAction<string>) {
      state.loading = "failed";
      state.error = action.payload;
    },
    resetCuttinboardState(
      state,
      action: PayloadAction<{
        withError?: string;
      }>
    ) {
      state.organizationKey = null;
      state.refreshTime = 0;
      state.refreshingUser = false;
      if (action.payload.withError) {
        state.loading = "failed";
        state.error = action.payload.withError;
      } else {
        state.loading = "idle";
        state.error = undefined;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(refreshUserThunk.pending, (state) => {
      state.error = undefined;
      state.refreshingUser = true;
      console.info("%c Refreshing user", "color: green; font-weight: bold; ");
    });
    builder.addCase(refreshUserThunk.fulfilled, (state) => {
      if (state.loading === "failed") {
        state.error = undefined;
      }
      state.loading = "succeeded";
      state.refreshingUser = false;
    });
    builder.addCase(
      refreshUserThunk.rejected,
      (state, action: PayloadAction<Error | undefined>) => {
        state.refreshingUser = false;
        state.error = action.payload?.message;
        state.loading = "failed";
      }
    );
  },
});

export const {
  upsertKey,
  updateUserRefreshTime,
  setCuttinboardError,
  resetCuttinboardState,
} = cuttinboardSlice.actions;

type CuttinboardActions =
  | ReturnType<typeof upsertKey>
  | ReturnType<typeof updateUserRefreshTime>
  | ReturnType<typeof setCuttinboardError>
  | ReturnType<typeof resetCuttinboardState>;

export const cuttinboardReducer: Reducer<CuttinboardState, CuttinboardActions> =
  cuttinboardSlice.reducer;

export const selectOrganizationKey = (state: RootState) =>
  state.cuttinboard.organizationKey;

export const selectCuttinboardError = (state: RootState) =>
  state.cuttinboard.error;

export const selectCuttinboardRefreshTime = (state: RootState) =>
  state.cuttinboard.refreshTime;

export const selectCuttinboardRefreshingUser = (state: RootState) =>
  state.cuttinboard.refreshingUser;

export const selectCuttinboardState = (state: RootState) => state.cuttinboard;
