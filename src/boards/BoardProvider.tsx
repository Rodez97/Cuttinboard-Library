import {
  addDoc,
  collection,
  collectionGroup,
  FirestoreError,
  query,
  serverTimestamp,
  where,
  WithFieldValue,
} from "firebase/firestore";
import React, { ReactNode, useMemo, useState } from "react";
import {
  FirebaseSignature,
  FIRESTORE,
  PrivacyLevel,
  RoleAccessLevels,
} from "..";
import { Board, IBoard } from "./Board";
import { useCuttinboardLocation } from "../services/useCuttinboardLocation";
import { useCuttinboard } from "../services/useCuttinboard";
import { useBoardsData } from "./useMultipleQueryListener";

export interface IBoardProvider {
  /**
   * The reference to the board collection
   */
  boardName: string;
  /**
   * The Children to render.
   * - Can be a function.
   * - Can be a ReactNode.
   * @example
   * ```tsx
   * <BoardProvider baseRef={baseRef}>
   *  {({loading, error, boards, selectedBoard}) => (<div>{selectedBoard.name}</div>)}
   * </BoardProvider>
   * ```
   */
  children:
    | ReactNode
    | ((props: {
        /**
         * Whether the data is loading
         */
        loading: boolean;
        /**
         * The error if there is one
         */
        error?: Error | FirestoreError | null | undefined;
        /**
         * The boards that are available
         */
        boards?: Board[];
        /**
         * The selected board if there is one
         */
        selectedBoard?: Board;
      }) => JSX.Element);
}

/**
 * The Board Provider Context
 */
export interface IBoardContext {
  /**
   * The selected board, or undefined if not found.
   */
  selectedBoard?: Board;
  /**
   * Selects a board by its ID
   * @param id The ID of the board to select
   */
  selectBoard: (id: string) => void;
  /**
   * The addNewBoard function is used to add a new board to a database, and return its ID.
   * @param newBoardData The data for the new board.
   * @returns The ID of the newly added board.
   * @remarks
   * If the privacyLevel of the new board is set to PUBLIC, the function also adds the "pl_public" access tag to the elementToAdd object.
   * @example
   * ```tsx
   * const newBoardId = await addNewBoard({
   *  name: "New Board",
   *  privacyLevel: PrivacyLevel.PRIVATE,
   * });
   * ```
   */
  addNewBoard: (newBoardData: {
    name: string;
    description?: string;
    position?: string;
    privacyLevel: PrivacyLevel;
  }) => Promise<string>;
  /**
   * The list of boards
   */
  boards?: Board[];
  /**
   * Whether the current user has the ability to manage the selected board.
   */
  canManageBoard: boolean;
  /**
   * Whether the data is loading
   */
  loading: boolean;
  /**
   * The error if there is one
   */
  error?: Error | FirestoreError | null | undefined;
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
export function BoardProvider({ children, boardName }: IBoardProvider) {
  const [selectedBoardId, selectBoard] = useState("");
  const { user } = useCuttinboard();
  const { location, positions, role } = useCuttinboardLocation();
  const [boards, loading, error] = useBoardsData(
    role,
    query(
      collectionGroup(FIRESTORE, boardName),
      where(`parentId`, "in", [location.id, location.organizationId])
    ).withConverter(Board.firestoreConverter),
    collection(
      FIRESTORE,
      "Organizations",
      location.organizationId,
      boardName
    ).withConverter(Board.firestoreConverter),
    query(
      collection(FIRESTORE, "Locations", location.id, boardName),
      where(`accessTags`, "array-contains-any", [
        user.uid,
        `hostId_${user.uid}`,
        "pl_public",
        ...positions,
      ])
    ).withConverter(Board.firestoreConverter)
  );

  /**
   * The selected board, or undefined if not found.
   */
  const selectedBoard = useMemo(
    () =>
      boards && selectedBoardId
        ? boards.find((ap) => ap.id === selectedBoardId)
        : undefined,
    [selectedBoardId, boards]
  );

  /**
   * {@inheritdoc IBoardProviderContext.addNewBoard}
   */
  const addNewBoard = async ({
    name,
    description,
    position,
    privacyLevel,
  }: {
    name: string;
    description?: string;
    position?: string;
    privacyLevel: PrivacyLevel;
  }): Promise<string> => {
    const firestoreRef = collection(
      FIRESTORE,
      "Locations",
      location.id,
      boardName
    );
    const elementToAdd: WithFieldValue<IBoard & FirebaseSignature> = {
      name,
      description,
      privacyLevel,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      parentId: location.id,
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
    const newModuleRef = await addDoc(firestoreRef, elementToAdd);
    return newModuleRef.id;
  };

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
    return selectedBoard.amIhost;
  }, [user.uid, selectedBoard, role]);

  return (
    <BoardContext.Provider
      value={{
        selectedBoard,
        selectBoard,
        boards,
        canManageBoard,
        loading,
        error,
        addNewBoard,
      }}
    >
      {typeof children === "function"
        ? children({
            loading,
            error,
            boards,
            selectedBoard,
          })
        : children}
    </BoardContext.Provider>
  );
}
