import { useEffect, useMemo, useReducer, useState } from "react";
import { useCuttinboard } from "../cuttinboard";
import { listReducer } from "../utils/listReducer";
import { BoardCollection, IBoard } from "@rodez97/types-helpers";
import { collection, onSnapshot } from "firebase/firestore";
import { FIRESTORE } from "../utils";
import { boardConverter } from "../boards";

export function useGBoardsData(boardCollection: BoardCollection) {
  const { onError, user } = useCuttinboard();
  const [selectedBoardId, selectBoardId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [boards, dispatch] = useReducer(listReducer<IBoard>("id"), []);

  useEffect(() => {
    setLoading(true);

    const singleQuery = collection(
      FIRESTORE,
      "Organizations",
      user.uid,
      boardCollection
    ).withConverter(boardConverter);

    const unsubscribe = onSnapshot(
      singleQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            dispatch({ type: "ADD_ELEMENT", payload: change.doc.data() });
          }
          if (change.type === "modified") {
            dispatch({ type: "SET_ELEMENT", payload: change.doc.data() });
          }
          if (change.type === "removed") {
            dispatch({ type: "DELETE_BY_ID", payload: change.doc.id });
          }
        });
        setLoading(false);
      },
      (err) => {
        setError(err);
        onError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [boardCollection, onError, user.uid]);

  const selectedBoard = useMemo(() => {
    return boards.find((note) => note.id === selectedBoardId);
  }, [boards, selectedBoardId]);

  return {
    boards,
    selectedBoard,
    selectedBoardId,
    selectBoardId,
    loading,
    error,
  };
}
