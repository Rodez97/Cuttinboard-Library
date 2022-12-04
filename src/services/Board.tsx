import {
  addDoc,
  CollectionReference,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import React, { ReactNode, useContext, useMemo, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { PrivacyLevel, RoleAccessLevels } from "..";
import { Board, IBoard } from "../models/modules/Board";
import { useLocation } from "./Location";
import { useCuttinboard } from "./Cuttinboard";

export interface IBoardProviderProps {
  /**
   * The reference to the board collection
   */
  baseRef: CollectionReference;
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
        error?: Error;
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
export interface IBoardProviderContext {
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
  addNewBoard: (newBoardData: Omit<IBoard, "locationId">) => Promise<string>;
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
  error?: Error;
}

/**
 * The Board Provider Context that is used to select a board and create new boards.
 */
export const BoardContext = React.createContext<IBoardProviderContext>(
  {} as IBoardProviderContext
);

/**
 * The Board Provider
 * @param props The props for the board provider component.
 * @returns A React Component that provides the board context.
 */
export function BoardProvider({ children, baseRef }: IBoardProviderProps) {
  const [selectedBoardId, selectBoard] = useState("");
  const { user } = useCuttinboard();
  const { locationAccessKey, location } = useLocation();
  const [boards, loading, error] = useCollectionData<Board>(
    (locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER
      ? query(baseRef, where(`locationId`, "==", location.id))
      : query(
          baseRef,
          where(`locationId`, "==", location.id),
          where(`accessTags`, "array-contains-any", [
            user.uid,
            `hostId_${user.uid}`,
            "pl_public",
            ...(locationAccessKey.pos ?? []),
          ])
        )
    ).withConverter(Board.Converter)
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
  const addNewBoard = async (
    newBoardData: Omit<IBoard, "locationId">
  ): Promise<string> => {
    const elementToAdd = {
      ...newBoardData,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      locationId: location.id,
    };
    if (newBoardData.privacyLevel === PrivacyLevel.PUBLIC) {
      elementToAdd.accessTags = ["pl_public"];
    }
    const newModuleRef = await addDoc(baseRef, elementToAdd);
    return newModuleRef.id;
  };

  /**
   * {@inheritdoc IBoardProviderContext.canManageBoard}
   */
  const canManageBoard = useMemo(() => {
    if (locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER) {
      return true;
    }
    if (!selectedBoard) {
      return false;
    }
    return Boolean(
      locationAccessKey.role <= RoleAccessLevels.MANAGER &&
        selectedBoard.amIhost
    );
  }, [user.uid, selectedBoard, locationAccessKey]);

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

/**
 * A hook that returns the board context
 * @returns The Board Context
 */
export const useBoard = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error(
      "useBoard must be used within a BoardProvider. Wrap a parent component in <BoardProvider> to fix this error."
    );
  }
  return context;
};
