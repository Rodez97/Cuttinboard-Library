import {
  BoardCollection,
  IBoard,
  PrivacyLevel,
} from "@cuttinboard-solutions/types-helpers";
import { nanoid } from "@reduxjs/toolkit";
import { collection, doc, Timestamp } from "firebase/firestore";
import React, { ReactNode, useCallback, useEffect } from "react";
import { collectionData } from "rxfire/firestore";
import {
  boardConverter,
  FIRESTORE,
  useAppDispatch,
  useAppSelector,
  useBoardsThunkDispatch,
} from "..";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import {
  makeSelectGlobalBoardById,
  makeSelectGlobalBoardError,
  makeSelectGlobalBoardId,
  makeSelectGlobalBoardLoading,
  makeSelectGlobalBoardLoadingStatus,
  makeSelectGlobalBoards,
  selectGlobalBoardActions,
  selectGlobalBoardThunks,
} from "./createGlobalBoardSlice";

export interface IGBoardProvider {
  boardCollection: BoardCollection;
  children: ReactNode;
  onError: (error: Error) => void;
}

/**
 * The Board Provider Context
 */
export interface IGBoardContext {
  /**
   * The selected board, or undefined if not found.
   */
  selectedBoard?: IBoard | undefined | null;
  boards: IBoard[];
  loading: boolean;
  error?: string | undefined;
  /**
   * Selects a board by its ID
   * @param id The ID of the board to select
   */
  selectActiveBoard: (boardId?: string) => void;
  addNewBoard: (newBoardData: { name: string; description?: string }) => string;
  updateBoard: (
    board: IBoard,
    updates: {
      name?: string;
      description?: string;
    }
  ) => void;
  deleteBoard: (board: IBoard) => void;
}

/**
 * The Board Provider Context that is used to select a board and create new boards.
 */
export const GBoardContext = React.createContext<IGBoardContext>(
  {} as IGBoardContext
);

/**
 * The Board Provider
 * @param props The props for the board provider component.
 * @returns A React Component that provides the board context.
 */
export function GBoardProvider({
  children,
  boardCollection,
  onError,
}: IGBoardProvider) {
  const { user } = useCuttinboard();
  const boardId = useAppSelector(makeSelectGlobalBoardId(boardCollection));
  const boards = useAppSelector(makeSelectGlobalBoards(boardCollection));
  const selectedBoard = useAppSelector((state) =>
    makeSelectGlobalBoardById(boardCollection)(state, boardId)
  );
  const loading = useAppSelector(makeSelectGlobalBoardLoading(boardCollection));
  const error = useAppSelector(makeSelectGlobalBoardError(boardCollection));
  const loadingStatus = useAppSelector(
    makeSelectGlobalBoardLoadingStatus(boardCollection)
  );
  const thunkDispatch = useBoardsThunkDispatch();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (loadingStatus === "idle") {
      // Start loading
      dispatch(
        selectGlobalBoardActions(boardCollection).setBoardsLoading("pending")
      );
    }

    const subscription = collectionData(
      collection(
        FIRESTORE,
        "Organizations",
        user.uid,
        boardCollection
      ).withConverter(boardConverter)
    ).subscribe({
      next: (boards) =>
        dispatch(selectGlobalBoardActions(boardCollection).setBoards(boards)),
      error: (err) => {
        dispatch(
          selectGlobalBoardActions(boardCollection).setBoardsError(err?.message)
        );
        onError(err);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [boardCollection, user.uid, dispatch]);

  /**
   * {@inheritdoc IBoardProviderContext.addNewBoard}
   */
  const addNewBoard = useCallback(
    (newBoardData: { name: string; description?: string }): string => {
      const id = nanoid();
      const firestoreRef = doc(
        FIRESTORE,
        "Organizations",
        user.uid,
        boardCollection,
        id
      );
      const elementToAdd: IBoard = {
        ...newBoardData,
        parentId: user.uid,
        privacyLevel: PrivacyLevel.PUBLIC,
        accessTags: ["pl_public"],
        global: true,
        id,
        refPath: firestoreRef.path,
        createdAt: Timestamp.now().toMillis(),
      };
      thunkDispatch(
        selectGlobalBoardThunks(boardCollection).addBoardThunk(elementToAdd)
      ).catch(onError);
      return id;
    },
    [boardCollection, user.uid, thunkDispatch]
  );

  const selectActiveBoard = useCallback(
    (boardId?: string) => {
      dispatch(
        selectGlobalBoardActions(boardCollection).setSelectedBoardId(boardId)
      );
    },
    [dispatch, boardCollection]
  );

  const updateBoard = useCallback(
    (
      board: IBoard,
      updates: {
        name?: string;
        description?: string;
      }
    ) => {
      thunkDispatch(
        selectGlobalBoardThunks(boardCollection).updateBoardThunk(
          board,
          updates
        )
      ).catch(onError);
    },
    [boardCollection, thunkDispatch]
  );

  const deleteBoard = useCallback(
    (board: IBoard) => {
      thunkDispatch(
        selectGlobalBoardThunks(boardCollection).deleteBoardThunk(board)
      ).catch(onError);
    },
    [boardCollection, thunkDispatch]
  );

  return (
    <GBoardContext.Provider
      value={{
        boards,
        selectedBoard,
        addNewBoard,
        selectActiveBoard,
        updateBoard,
        deleteBoard,
        loading,
        error,
      }}
    >
      {children}
    </GBoardContext.Provider>
  );
}
