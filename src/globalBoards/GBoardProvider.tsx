import {
  BoardCollection,
  IBoard,
  PrivacyLevel,
} from "@cuttinboard-solutions/types-helpers";
import { boardConverter } from "../boards/boardHelpers";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { deleteDoc, doc, setDoc, Timestamp } from "firebase/firestore";
import React, { ReactNode, useCallback } from "react";
import { FIRESTORE } from "../utils/firebase";
import { useGBoardsData } from "./useGBoardsData";
import { nanoid } from "nanoid";

export interface IGBoardProvider {
  boardCollection: BoardCollection;
  children: ReactNode;
  onError: (error: Error) => void;
}

/**
 * The Board Provider Context
 */
export interface IGBoardContext {
  boards: IBoard[];
  selectedBoard?: IBoard | undefined;
  loading: boolean;
  error?: Error | undefined;
  selectBoardId: (boardId?: string) => void;
  addNewBoard: (newBoardData: {
    name: string;
    description?: string;
  }) => Promise<string>;
  updateBoard: (
    board: IBoard,
    updates: {
      name?: string;
      description?: string;
    }
  ) => Promise<void>;
  deleteBoard: (board: IBoard) => Promise<void>;
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
  const { boards, selectedBoard, selectBoardId, loading, error } =
    useGBoardsData(boardCollection);

  const addNewBoard = useCallback(
    async (newBoardData: {
      name: string;
      description?: string;
    }): Promise<string> => {
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

      try {
        await setDoc(firestoreRef, elementToAdd, {
          merge: true,
        });
        return id;
      } catch (error) {
        onError(error);
        throw error;
      }
    },
    [user.uid, boardCollection, onError]
  );

  const updateBoard = useCallback(
    async (
      board: IBoard,
      updates: {
        name?: string;
        description?: string;
      }
    ) => {
      // Update the board on the server
      const docRef = doc(FIRESTORE, board.refPath).withConverter(
        boardConverter
      );

      try {
        await setDoc(docRef, updates, {
          merge: true,
        });
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const deleteBoard = useCallback(
    async (board: IBoard) => {
      // Delete the board from the server
      const docRef = doc(FIRESTORE, board.refPath).withConverter(
        boardConverter
      );

      try {
        await deleteDoc(docRef);
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  return (
    <GBoardContext.Provider
      value={{
        boards,
        selectedBoard,
        loading,
        error,
        selectBoardId,
        addNewBoard,
        updateBoard,
        deleteBoard,
      }}
    >
      {children}
    </GBoardContext.Provider>
  );
}
