import { addDoc, collection } from "firebase/firestore";
import React, { ReactNode, useMemo, useRef, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { FIRESTORE, PrivacyLevel } from "..";
import { useCuttinboard } from "../services/useCuttinboard";
import { GlobalBoard } from "./GlobalBoard";

export interface IGBoardProvider {
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
        error?: Error;
        /**
         * The boards that are available
         */
        boards?: GlobalBoard[];
        /**
         * The selected board if there is one
         */
        selectedBoard?: GlobalBoard;
      }) => JSX.Element);
}

/**
 * The Board Provider Context
 */
export interface IGBoardContext {
  /**
   * The selected board, or undefined if not found.
   */
  selectedBoard?: GlobalBoard;
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
  }) => Promise<string>;
  /**
   * The list of boards
   */
  boards?: GlobalBoard[];
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
export const GBoardContext = React.createContext<IGBoardContext>(
  {} as IGBoardContext
);

/**
 * The Board Provider
 * @param props The props for the board provider component.
 * @returns A React Component that provides the board context.
 */
export function GBoardProvider({ children, boardName }: IGBoardProvider) {
  const { user } = useCuttinboard();
  const baseRef = useRef(
    collection(FIRESTORE, "Organizations", user.uid, boardName)
  );
  const [selectedBoardId, selectBoard] = useState("");
  const [boards, loading, error] = useCollectionData<GlobalBoard>(
    baseRef.current.withConverter(GlobalBoard.firestoreConverter)
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
  const addNewBoard = async (newBoardData: {
    name: string;
    description?: string;
  }): Promise<string> => {
    const elementToAdd = {
      ...newBoardData,
      parentId: user.uid,
      privacyLevel: PrivacyLevel.PUBLIC,
      accessTags: ["pl_public"],
      global: true,
    };
    const newModuleRef = await addDoc(baseRef.current, elementToAdd);
    return newModuleRef.id;
  };

  return (
    <GBoardContext.Provider
      value={{
        selectedBoard,
        selectBoard,
        boards,
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
    </GBoardContext.Provider>
  );
}
