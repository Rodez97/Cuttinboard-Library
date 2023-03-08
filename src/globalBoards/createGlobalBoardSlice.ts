import { BoardCollection, IBoard } from "@cuttinboard-solutions/types-helpers";
import {
  createSlice,
  PayloadAction,
  createSelector,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { merge } from "lodash";
import {
  boardConverter,
  boardsSelectors,
  BoardState,
  BoardThunk,
} from "../boards";
import { LoadingStatus } from "../models";
import { RootState } from "../reduxStore/utils";
import { FIRESTORE } from "../utils";

const boardsAdapter = createEntityAdapter<IBoard>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export function createGlobalBoardSlice(boardCollection: BoardCollection) {
  const slice = createSlice({
    name: `globalBoards_${boardCollection}`,
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
        // Update the loading state as appropriate
        if (state.loading === "idle" || state.loading === "pending") {
          state.loading = "succeeded";
        } else if (state.loading === "failed") {
          state.loading = "succeeded";
          state.error = undefined;
        }
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

  const { addBoard, deleteBoard, upsertBoard } = slice.actions;

  const deleteBoardThunk =
    (board: IBoard): BoardThunk =>
    async (dispatch) => {
      // Delete the board from the server
      const docRef = doc(FIRESTORE, board.refPath).withConverter(
        boardConverter
      );

      // Delete the board from the local state
      dispatch(deleteBoard(board.id));
      try {
        await deleteDoc(docRef);
      } catch (error) {
        console.log("Error deleting board", error);
        // If the server fails, add the board back to the local state
        dispatch(addBoard(board));
      }
    };

  const updateBoardThunk =
    (
      board: IBoard,
      updates: {
        name?: string;
        description?: string;
      }
    ): BoardThunk =>
    async (dispatch) => {
      // Update the board on the server
      const docRef = doc(FIRESTORE, board.refPath).withConverter(
        boardConverter
      );

      const localUpdates = board;
      merge(localUpdates, updates);

      // Update the board in the local state
      dispatch(upsertBoard(localUpdates));
      try {
        await setDoc(docRef, updates, {
          merge: true,
        });
      } catch (error) {
        console.log("Error updating board", error);
        // If the server fails, revert the board in the local state
        dispatch(upsertBoard(board));
      }
    };

  const addBoardThunk =
    (board: IBoard): BoardThunk =>
    async (dispatch) => {
      // Add the board to the server
      const docRef = doc(FIRESTORE, board.refPath).withConverter(
        boardConverter
      );

      // Add the board to the local state
      dispatch(addBoard(board));
      try {
        await setDoc(docRef, board, {
          merge: true,
        });
      } catch (error) {
        console.log("Error adding board", error);
        // If the server fails, remove the board from the local state
        dispatch(deleteBoard(board.id));
      }
    };

  return {
    thunks: {
      addBoardThunk,
      deleteBoardThunk,
      updateBoardThunk,
    },
    slice,
    actions: slice.actions,
    reducer: slice.reducer,
  };
}

const getGlobalBoardName = (boardCollection: BoardCollection) => {
  switch (boardCollection) {
    case "notes":
      return "globalNotesBoards";
    case "files":
      return "globalFilesBoards";
  }
};

export const globalNotesBoardSlice = createGlobalBoardSlice("notes");

export const globalFilesBoardSlice = createGlobalBoardSlice("files");

export const selectGlobalBoardThunks = (boardCollection: BoardCollection) => {
  switch (boardCollection) {
    case "notes":
      return globalNotesBoardSlice.thunks;
    case "files":
      return globalFilesBoardSlice.thunks;
  }
};

export const selectGlobalBoardActions = (boardCollection: BoardCollection) => {
  switch (boardCollection) {
    case "notes":
      return globalNotesBoardSlice.actions;
    case "files":
      return globalFilesBoardSlice.actions;
  }
};

export const makeSelectGlobalBoardById = (boardCollection: BoardCollection) => {
  const globalBoardName = getGlobalBoardName(boardCollection);
  const selectBoardById = createSelector(
    [
      (state: RootState) => state[globalBoardName],
      (_: RootState, id: string | undefined | null) => {
        if (!id) {
          return "";
        }
        return id;
      },
    ],
    (boards, id) => boardsSelectors.selectById(boards, id)
  );
  return selectBoardById;
};

export const makeSelectGlobalBoards = (boardCollection: BoardCollection) => {
  const globalBoardName = getGlobalBoardName(boardCollection);
  const selectBoards = createSelector(
    (state: RootState) => state[globalBoardName],
    (boards) => boardsSelectors.selectAll(boards)
  );
  return selectBoards;
};

export const makeSelectGlobalBoardId = (boardCollection: BoardCollection) => {
  const globalBoardName = getGlobalBoardName(boardCollection);
  const selectedBoardId = createSelector(
    (state: RootState) => state[globalBoardName],
    (boards) => boards.selectedBoardId
  );
  return selectedBoardId;
};

export const makeSelectGlobalBoardLoading = (
  boardCollection: BoardCollection
) =>
  createSelector(
    (state: RootState) => state[getGlobalBoardName(boardCollection)],
    (boards) => boards.loading === "pending" || boards.loading === "idle"
  );

export const makeSelectGlobalBoardError = (boardCollection: BoardCollection) =>
  createSelector(
    (state: RootState) => state[getGlobalBoardName(boardCollection)],
    (boards) => boards.error
  );

export const makeSelectGlobalBoardLoadingStatus = (
  boardCollection: BoardCollection
) =>
  createSelector(
    (state: RootState) => state[getGlobalBoardName(boardCollection)],
    (boards) => boards.loading
  );
