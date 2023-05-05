import { deleteDoc, doc, setDoc, Timestamp } from "firebase/firestore";
import React, { ReactNode, useCallback, useMemo } from "react";
import {
  BoardCollection,
  BoardUpdate,
  IBoard,
  IEmployee,
  PrivacyLevel,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import {
  addBoardHost,
  boardConverter,
  getAddMembersData,
  getRemoveMemberData,
  getUpdateBoardData,
  removeBoardHost,
} from "./boardHelpers";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { useCuttinboardLocation } from "../cuttinboardLocation/useCuttinboardLocation";
import { FIRESTORE } from "../utils/firebase";
import { useBoardsData } from "./useBoardsData";
import { nanoid } from "nanoid";

export interface IBoardProvider {
  boardCollection: BoardCollection;
  children: ReactNode;
}

/**
 * The Board Provider Context
 */
export interface IBoardContext {
  boards: IBoard[];
  selectedBoard?: IBoard | undefined;
  selectBoardId: (boardId?: string) => void;
  loading: boolean;
  error?: Error | undefined;
  canManageBoard: boolean;
  addNewBoard: (props: {
    name: string;
    description?: string | undefined;
    position?: string | undefined;
    privacyLevel: PrivacyLevel;
  }) => Promise<string>;
  deleteBoard: (board: IBoard) => Promise<void>;
  updateBoard: (board: IBoard, updates: BoardUpdate) => Promise<void>;
  addHost: (board: IBoard, newHost: IEmployee) => Promise<void>;
  removeHost: (board: IBoard, hostId: string) => Promise<void>;
  addMembers: (board: IBoard, newMembers: IEmployee[]) => Promise<void>;
  removeMember: (board: IBoard, memberId: string) => Promise<void>;
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
  const { location, role } = useCuttinboardLocation();
  const { boards, selectedBoard, selectBoardId, loading, error } =
    useBoardsData(boardCollection);

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

  const addNewBoard = useCallback(
    async ({
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

      const docRef = doc(FIRESTORE, elementToAdd.refPath).withConverter(
        boardConverter
      );
      try {
        await setDoc(docRef, elementToAdd, {
          merge: true,
        });
        return id;
      } catch (error) {
        onError(error);
        throw error;
      }
    },
    [location.id, boardCollection, onError]
  );

  const deleteBoard = useCallback(
    async (board: IBoard) => {
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

  const updateBoard = useCallback(
    async (board: IBoard, updates: BoardUpdate) => {
      const docRef = doc(FIRESTORE, board.refPath).withConverter(
        boardConverter
      );
      const serverUpdates = getUpdateBoardData(board, updates);
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const addHost = useCallback(
    async (board: IBoard, newHost: IEmployee) => {
      const docRef = doc(FIRESTORE, board.refPath).withConverter(
        boardConverter
      );
      const serverUpdate = addBoardHost(board, newHost);
      try {
        await setDoc(docRef, serverUpdate, {
          merge: true,
        });
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const removeHost = useCallback(
    async (board: IBoard, hostId: string) => {
      const docRef = doc(FIRESTORE, board.refPath).withConverter(
        boardConverter
      );
      const serverUpdate = removeBoardHost(board, hostId);
      try {
        await setDoc(docRef, serverUpdate, {
          merge: true,
        });
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const addMembers = useCallback(
    async (board: IBoard, newMembers: IEmployee[]) => {
      const docRef = doc(FIRESTORE, board.refPath).withConverter(
        boardConverter
      );
      const updates = getAddMembersData(board, newMembers);
      if (!updates) {
        return;
      }

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

  const removeMember = useCallback(
    async (board: IBoard, memberId: string) => {
      const docRef = doc(FIRESTORE, board.refPath).withConverter(
        boardConverter
      );
      const updates = getRemoveMemberData(board, memberId);
      if (!updates) {
        return;
      }

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

  return (
    <BoardContext.Provider
      value={{
        boards,
        selectedBoard,
        selectBoardId,
        loading,
        error,
        canManageBoard,
        addNewBoard,
        deleteBoard,
        updateBoard,
        addHost,
        removeHost,
        addMembers,
        removeMember,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}
