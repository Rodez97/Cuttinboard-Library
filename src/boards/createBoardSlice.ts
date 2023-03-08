import {
  BoardCollection,
  BoardUpdate,
  IBoard,
  IEmployee,
} from "@cuttinboard-solutions/types-helpers";
import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  EntityState,
  createSelector,
  ThunkAction,
  AnyAction,
  ThunkDispatch,
} from "@reduxjs/toolkit";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import {
  boardConverter,
  getAddMembersData,
  addBoardHost,
  removeBoardHost,
  getRemoveMemberData,
  getUpdateBoardData,
} from ".";
import { LoadingStatus } from "../models";
import { RootState } from "../reduxStore/utils";
import { FIRESTORE } from "../utils";

const boardsAdapter = createEntityAdapter<IBoard>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export interface BoardState extends LoadingStatus {
  selectedBoardId?: string;
}

export type BoardThunk = ThunkAction<
  Promise<void>,
  BoardState & EntityState<IBoard>,
  unknown,
  AnyAction
>;

export const useBoardsThunkDispatch = () =>
  useDispatch<
    ThunkDispatch<EntityState<IBoard> & BoardState, void, AnyAction>
  >();

export function createBoardSlice(boardCollection: BoardCollection) {
  const slice = createSlice({
    name: boardCollection,
    initialState: boardsAdapter.getInitialState<BoardState>({
      loading: "idle",
    }),
    reducers: {
      addBoard: boardsAdapter.addOne,
      updateBoard: boardsAdapter.updateOne,
      upsertBoard: boardsAdapter.upsertOne,
      deleteBoard: boardsAdapter.removeOne,
      setSelectedBoardId(state, action: PayloadAction<string | undefined>) {
        state.selectedBoardId = action.payload;
      },
      setBoards(state, action: PayloadAction<IBoard[]>) {
        if (state.loading === "failed") {
          state.error = undefined;
        }
        state.loading = "succeeded";
        boardsAdapter.setAll(state, action.payload);
      },
      setBoardsLoading(state, action: PayloadAction<LoadingStatus["loading"]>) {
        state.loading = action.payload;
      },
      setBoardsError(state, action: PayloadAction<string>) {
        state.error = action.payload;
        state.loading = "failed";
      },
    },
  });

  const { addBoard, deleteBoard, upsertBoard, updateBoard } = slice.actions;

  const deleteBoardThunk =
    (board: IBoard): BoardThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, board.refPath).withConverter(
        boardConverter
      );
      dispatch(deleteBoard(board.id));
      try {
        await deleteDoc(docRef);
      } catch (error) {
        dispatch(addBoard(board));
        throw error;
      }
    };

  const updateBoardThunk =
    (board: IBoard, updates: BoardUpdate): BoardThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, board.refPath).withConverter(
        boardConverter
      );
      const { serverUpdates, localUpdates } = getUpdateBoardData(
        board,
        updates
      );
      dispatch(
        updateBoard({
          id: board.id,
          changes: localUpdates,
        })
      );
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        dispatch(upsertBoard(board));
        throw error;
      }
    };

  const addBoardThunk =
    (board: IBoard): BoardThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, board.refPath).withConverter(
        boardConverter
      );
      dispatch(addBoard(board));
      try {
        await setDoc(docRef, board, {
          merge: true,
        });
      } catch (error) {
        dispatch(deleteBoard(board.id));
        throw error;
      }
    };

  const addHostThunk =
    (board: IBoard, newHost: IEmployee): BoardThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, board.refPath).withConverter(
        boardConverter
      );
      const { serverUpdate, localUpdate } = addBoardHost(board, newHost);
      updateBoard({
        id: board.id,
        changes: localUpdate,
      });
      try {
        await setDoc(docRef, serverUpdate, {
          merge: true,
        });
      } catch (error) {
        dispatch(upsertBoard(board));
        throw error;
      }
    };

  const removeHostThunk =
    (board: IBoard, hostId: string): BoardThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, board.refPath).withConverter(
        boardConverter
      );
      const { serverUpdate, localUpdate } = removeBoardHost(board, hostId);
      updateBoard({
        id: board.id,
        changes: localUpdate,
      });
      try {
        await setDoc(docRef, serverUpdate, {
          merge: true,
        });
      } catch (error) {
        dispatch(upsertBoard(board));
        throw error;
      }
    };

  const addMembersThunk =
    (board: IBoard, newMembers: IEmployee[]): BoardThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, board.refPath).withConverter(
        boardConverter
      );
      const updates = getAddMembersData(board, newMembers);
      if (!updates) {
        return;
      }
      const { serverUpdates, localUpdates } = updates;
      dispatch(upsertBoard(localUpdates));
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        dispatch(upsertBoard(board));
        throw error;
      }
    };

  const removeMemberThunk =
    (board: IBoard, memberId: string): BoardThunk =>
    async (dispatch) => {
      const docRef = doc(FIRESTORE, board.refPath).withConverter(
        boardConverter
      );
      const updates = getRemoveMemberData(board, memberId);
      if (!updates) {
        return;
      }
      const { serverUpdates, localUpdates } = updates;
      dispatch(upsertBoard(localUpdates));
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        dispatch(upsertBoard(board));
        throw error;
      }
    };

  return {
    thunks: {
      addBoardThunk,
      deleteBoardThunk,
      updateBoardThunk,
      addHostThunk,
      removeHostThunk,
      addMembersThunk,
      removeMemberThunk,
    },
    slice,
    actions: slice.actions,
    reducer: slice.reducer,
  };
}

export const notesBoardSlice = createBoardSlice("notes");

export const filesBoardSlice = createBoardSlice("files");

// Selectors
export const boardsSelectors = boardsAdapter.getSelectors();

export const selectBoardThunks = (boardCollection: BoardCollection) => {
  switch (boardCollection) {
    case "notes":
      return notesBoardSlice.thunks;
    case "files":
      return filesBoardSlice.thunks;
  }
};

export const selectBoardActions = (boardCollection: BoardCollection) => {
  switch (boardCollection) {
    case "notes":
      return notesBoardSlice.actions;
    case "files":
      return filesBoardSlice.actions;
  }
};

export const makeSelectBoardById = (boardCollection: BoardCollection) =>
  createSelector(
    (state: RootState) => state[`${boardCollection}Boards`],
    makeSelectBoardId(boardCollection),
    (boards, id) => (id ? boardsSelectors.selectById(boards, id) : null)
  );

export const makeSelectBoards = (boardCollection: BoardCollection) =>
  createSelector(
    (state: RootState) => state[`${boardCollection}Boards`],
    (boards) => boardsSelectors.selectAll(boards)
  );

export const makeSelectBoardId = (boardCollection: BoardCollection) =>
  createSelector(
    [(state: RootState) => state[`${boardCollection}Boards`]],
    (boards) => boards.selectedBoardId
  );

export const makeSelectBoardLoading = (boardCollection: BoardCollection) =>
  createSelector(
    [(state: RootState) => state[`${boardCollection}Boards`]],
    (boards) => boards.loading === "pending" || boards.loading === "idle"
  );

export const makeSelectBoardError = (boardCollection: BoardCollection) =>
  createSelector(
    [(state: RootState) => state[`${boardCollection}Boards`]],
    (boards) => boards.error
  );

export const makeSelectBoardLoadingStatus = (
  boardCollection: BoardCollection
) =>
  createSelector(
    [(state: RootState) => state[`${boardCollection}Boards`]],
    (boards) => boards.loading
  );
