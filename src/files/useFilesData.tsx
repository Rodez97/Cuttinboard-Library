import {
  IBoard,
  ICuttinboard_File,
} from "@cuttinboard-solutions/types-helpers";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useReducer, useState } from "react";
import { FIRESTORE } from "../utils/firebase";
import { cuttinboardFileConverter } from "./Cuttinboard_File";
import { listReducer } from "../utils/listReducer";

export function useFilesData(selectedBoard: IBoard | undefined) {
  const { onError } = useCuttinboard();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [files, dispatch] = useReducer(
    listReducer<ICuttinboard_File>("id"),
    []
  );

  useEffect(() => {
    if (!selectedBoard) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const unsubscribe = onSnapshot(
      collection(FIRESTORE, selectedBoard.refPath, "content").withConverter(
        cuttinboardFileConverter
      ),
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
      dispatch({ type: "CLEAR" });
    };
  }, [dispatch, onError, selectedBoard]);

  return { files, loading, error };
}
