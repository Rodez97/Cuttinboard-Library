import { IBoard, INote } from "@cuttinboard-solutions/types-helpers";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useReducer, useState } from "react";
import { FIRESTORE } from "../utils/firebase";
import { noteConverter } from "./Note";
import { listReducer } from "../utils/listReducer";

export function useNotesData(selectedBoard: IBoard | undefined) {
  const { onError } = useCuttinboard();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [notes, dispatch] = useReducer(listReducer<INote>("id"), []);

  useEffect(() => {
    if (!selectedBoard) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const unsubscribe = onSnapshot(
      collection(FIRESTORE, selectedBoard.refPath, "content").withConverter(
        noteConverter
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

  return { notes, loading, error };
}
