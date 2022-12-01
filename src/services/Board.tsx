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

export interface BoardProviderProps {
  baseRef: CollectionReference;
  children:
    | ReactNode
    | ((props: {
        loading: boolean;
        error?: Error;
        boards?: Board[];
        selectedBoard?: Board;
      }) => JSX.Element);
}

export interface BoardProviderContext {
  /**
   * The currently selected board
   */
  selectedBoard?: Board;
  /**
   * Selects a board by its ID
   * @param board
   */
  selectBoard: (id: string) => void;
  /**
   * Creates a new board.
   * @returns The newly created board Id.
   */
  newBoard: (boardData: Omit<IBoard, "locationId">) => Promise<string>;
  /**
   * The list of boards
   */
  boards?: Board[];
  /**
   * True if the user can manage boards
   */
  canManage: boolean;

  loading: boolean;
  error?: Error;
}

export const BoardContext = React.createContext<BoardProviderContext>(
  {} as BoardProviderContext
);

export function BoardProvider({ children, baseRef }: BoardProviderProps) {
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

  const selectedBoard = useMemo(
    () =>
      boards && selectedBoardId
        ? boards.find((ap) => ap.id === selectedBoardId)
        : undefined,
    [selectedBoardId, boards]
  );

  const newBoard = async (newApp: Omit<IBoard, "locationId">) => {
    const elementToAdd = {
      ...newApp,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      locationId: location.id,
    };
    if (newApp.privacyLevel === PrivacyLevel.PUBLIC) {
      elementToAdd.accessTags = ["pl_public"];
    }
    const newModuleRef = await addDoc(baseRef, elementToAdd);
    return newModuleRef.id;
  };

  const canManage = useMemo(() => {
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
        canManage,
        loading,
        error,
        newBoard,
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

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error(
      "useBoard must be used within a BoardProvider. Wrap a parent component in <BoardProvider> to fix this error."
    );
  }
  return context;
};
