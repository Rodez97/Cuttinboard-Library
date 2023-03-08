import {
  collection,
  collectionGroup,
  doc,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import React, { ReactNode, useCallback, useEffect, useMemo } from "react";
import { boardConverter, FIRESTORE, useAppDispatch, useAppSelector } from "..";
import { useCuttinboardLocation } from "../cuttinboardLocation/useCuttinboardLocation";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { getBoardsObservable } from "./useMultipleQueryListener";
import { nanoid } from "@reduxjs/toolkit";
import {
  selectBoardThunks,
  selectBoardActions,
  makeSelectBoards,
  makeSelectBoardById,
  makeSelectBoardLoading,
  makeSelectBoardError,
  useBoardsThunkDispatch,
  makeSelectBoardLoadingStatus,
} from "./createBoardSlice";
import {
  BoardCollection,
  BoardUpdate,
  IBoard,
  IEmployee,
  PrivacyLevel,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";

export interface IBoardProvider {
  boardCollection: BoardCollection;
  children: ReactNode;
}

/**
 * The Board Provider Context
 */
export interface IBoardContext {
  boards: IBoard[];
  selectedBoard?: IBoard | undefined | null;
  canManageBoard: boolean;
  loading: boolean;
  error?: string | undefined;
  deleteBoard: (board: IBoard) => void;
  addHost: (board: IBoard, newHost: IEmployee) => void;
  removeHost: (board: IBoard, hostId: string) => void;
  addMembers: (board: IBoard, newMembers: IEmployee[]) => void;
  removeMember: (board: IBoard, memberId: string) => void;
  updateBoard: (board: IBoard, updates: BoardUpdate) => void;
  selectActiveBoard: (boardId?: string) => void;
  addNewBoard: (args: {
    name: string;
    description?: string | undefined;
    position?: string | undefined;
    privacyLevel: PrivacyLevel;
  }) => string;
}

/**
 * The Board Provider Context that is used to select a board and create new boards.
 */
export const BoardContext = React.createContext<IBoardContext>(
  {} as IBoardContext
);

/**
 * The Board Provider
 * @param props The props for the board provider component.
 * @returns A React Component that provides the board context.
 */
export function BoardProvider({ children, boardCollection }: IBoardProvider) {
  const { user, onError } = useCuttinboard();
  const { location, positions, role } = useCuttinboardLocation();
  const [
    boardsSelector,
    selectedBoardSelector,
    loadingSelector,
    errorSelector,
    loadingStatusSelector,
  ] = useMemo(
    () => [
      makeSelectBoards(boardCollection),
      makeSelectBoardById(boardCollection),
      makeSelectBoardLoading(boardCollection),
      makeSelectBoardError(boardCollection),
      makeSelectBoardLoadingStatus(boardCollection),
    ],
    [boardCollection]
  );
  const boards = useAppSelector(boardsSelector);
  const selectedBoard = useAppSelector(selectedBoardSelector);
  const loading = useAppSelector(loadingSelector);
  const loadingStatus = useAppSelector(loadingStatusSelector);
  const error = useAppSelector(errorSelector);
  const thunkDispatch = useBoardsThunkDispatch();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const singleQuery = query(
      collectionGroup(FIRESTORE, boardCollection),
      where(`parentId`, "in", [location.id, location.organizationId])
    ).withConverter(boardConverter);

    const multiQuery = [
      collection(
        FIRESTORE,
        "Organizations",
        location.organizationId,
        boardCollection
      ).withConverter(boardConverter),
      query(
        collection(FIRESTORE, "Locations", location.id, boardCollection),
        where(`accessTags`, "array-contains-any", [
          user.uid,
          `hostId_${user.uid}`,
          "pl_public",
          ...positions,
        ])
      ).withConverter(boardConverter),
    ];

    if (loadingStatus !== "succeeded") {
      dispatch(selectBoardActions(boardCollection).setBoardsLoading("pending"));
    }

    const observables$ = getBoardsObservable(role, singleQuery, multiQuery);

    const subscription = observables$.subscribe({
      next: (boards) =>
        dispatch(selectBoardActions(boardCollection).setBoards(boards)),
      error: (err) => {
        dispatch(
          selectBoardActions(boardCollection).setBoardsError(err?.message)
        );
        onError(err);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [
    boardCollection,
    dispatch,
    location.id,
    location.organizationId,
    onError,
    positions,
    role,
    user.uid,
  ]);

  /**
   * {@inheritdoc IBoardProviderContext.addNewBoard}
   */
  const addNewBoard = useCallback(
    ({
      name,
      description,
      position,
      privacyLevel,
    }: {
      name: string;
      description?: string;
      position?: string;
      privacyLevel: PrivacyLevel;
    }): string => {
      const id = nanoid();
      const firestoreRef = doc(
        FIRESTORE,
        "Locations",
        location.id,
        boardCollection,
        id
      );
      const elementToAdd: IBoard = {
        name,
        description,
        privacyLevel,
        createdAt: Timestamp.now().toMillis(),
        parentId: location.id,
        refPath: firestoreRef.path,
        id,
      };
      if (privacyLevel === PrivacyLevel.PUBLIC) {
        elementToAdd.accessTags = ["pl_public"];
      }
      if (privacyLevel === PrivacyLevel.POSITIONS) {
        if (position) {
          elementToAdd.accessTags = [position];
        } else {
          throw new Error(
            "You must provide a position when creating a board with a privacy level of positions."
          );
        }
      }
      thunkDispatch(
        selectBoardThunks(boardCollection).addBoardThunk(elementToAdd)
      ).catch(onError);
      return id;
    },
    [location.id, boardCollection, thunkDispatch]
  );

  /**
   * {@inheritdoc IBoardProviderContext.canManageBoard}
   */
  const canManageBoard = useMemo(() => {
    if (role === RoleAccessLevels.OWNER) {
      return true;
    }
    if (role <= RoleAccessLevels.GENERAL_MANAGER) {
      return true;
    }
    if (!selectedBoard) {
      return false;
    }
    return Boolean(selectedBoard.hosts?.includes(user.uid));
  }, [user.uid, selectedBoard, role]);

  const selectActiveBoard = useCallback(
    (boardId?: string) => {
      dispatch(selectBoardActions(boardCollection).setSelectedBoardId(boardId));
    },
    [boardCollection, dispatch]
  );

  const deleteBoard = useCallback(
    (board: IBoard) => {
      thunkDispatch(
        selectBoardThunks(boardCollection).deleteBoardThunk(board)
      ).catch(onError);
    },
    [boardCollection, thunkDispatch]
  );

  const addHost = useCallback(
    (board: IBoard, newHost: IEmployee) => {
      thunkDispatch(
        selectBoardThunks(boardCollection).addHostThunk(board, newHost)
      ).catch(onError);
    },
    [boardCollection, dispatch]
  );

  const removeHost = useCallback(
    (board: IBoard, hostId: string) => {
      thunkDispatch(
        selectBoardThunks(boardCollection).removeHostThunk(board, hostId)
      ).catch(onError);
    },
    [boardCollection, dispatch]
  );

  const addMembers = useCallback(
    (board: IBoard, newMembers: IEmployee[]) => {
      thunkDispatch(
        selectBoardThunks(boardCollection).addMembersThunk(board, newMembers)
      ).catch(onError);
    },
    [boardCollection, dispatch]
  );

  const removeMember = useCallback(
    (board: IBoard, memberId: string) => {
      thunkDispatch(
        selectBoardThunks(boardCollection).removeMemberThunk(board, memberId)
      ).catch(onError);
    },
    [boardCollection, dispatch]
  );

  const updateBoard = useCallback(
    (board: IBoard, updates: BoardUpdate) => {
      thunkDispatch(
        selectBoardThunks(boardCollection).updateBoardThunk(board, updates)
      ).catch(onError);
    },
    [boardCollection, dispatch]
  );

  return (
    <BoardContext.Provider
      value={{
        boards,
        selectedBoard,
        addNewBoard,
        canManageBoard,
        selectActiveBoard,
        deleteBoard,
        addHost,
        removeHost,
        addMembers,
        removeMember,
        updateBoard,
        loading,
        error,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}
