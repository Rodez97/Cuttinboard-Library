import { IBoard } from "@cuttinboard-solutions/types-helpers";
import { collection } from "firebase/firestore";
import { useEffect, useMemo } from "react";
import { collectionData } from "rxfire/firestore";
import { useCuttinboard } from "../cuttinboard";
import { useAppSelector } from "../reduxStore";
import { FIRESTORE } from "../utils";
import { noteConverter } from "./Note";
import {
  noteLoadingStatusSelector,
  setNotes,
  setNotesError,
  setNotesLoading,
  useNotesDispatch,
} from "./notes.slice";

export function useNotesData(board: IBoard) {
  const dispatch = useNotesDispatch();
  const { onError } = useCuttinboard();
  const loadingStatusSelector = useMemo(
    () => noteLoadingStatusSelector(board.id),
    [board.id]
  );
  const loadingStatus = useAppSelector(loadingStatusSelector);

  useEffect(() => {
    if (loadingStatus !== "succeeded") {
      dispatch(
        setNotesLoading({
          boardId: board.id,
          loading: "pending",
        })
      );
    }

    const subscription = collectionData(
      collection(FIRESTORE, board.refPath, "content").withConverter(
        noteConverter
      )
    ).subscribe({
      next: (notes) => {
        dispatch(
          setNotes({
            boardId: board.id,
            notes,
          })
        );
      },
      error: (error) => {
        dispatch(
          setNotesError({
            boardId: board.id,
            error: error.message,
          })
        );
        onError(error);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [board.id, board.refPath, dispatch]);
}
