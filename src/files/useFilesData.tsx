import { IBoard } from "@cuttinboard-solutions/types-helpers";
import { collection } from "firebase/firestore";
import { useEffect, useMemo } from "react";
import { collectionData } from "rxfire/firestore";
import { useCuttinboard } from "../cuttinboard";
import { useAppDispatch, useAppSelector } from "../reduxStore/utils";
import { FIRESTORE } from "../utils";
import { cuttinboardFileConverter } from "./Cuttinboard_File";
import {
  fileLoadingStatusSelector,
  setFiles,
  setFilesError,
  setFilesLoading,
} from "./files.slice";

export function useFilesData(board: IBoard) {
  const dispatch = useAppDispatch();
  const { onError } = useCuttinboard();
  const loadingStatusSelector = useMemo(
    () => fileLoadingStatusSelector(board.id),
    [board.id]
  );
  const loadingStatus = useAppSelector(loadingStatusSelector);

  useEffect(() => {
    if (loadingStatus !== "succeeded") {
      dispatch(
        setFilesLoading({
          boardId: board.id,
          loading: "pending",
        })
      );
    }

    const subscription = collectionData(
      collection(FIRESTORE, board.refPath, "content").withConverter(
        cuttinboardFileConverter
      )
    ).subscribe({
      next: (files) =>
        dispatch(
          setFiles({
            boardId: board.id,
            files,
          })
        ),
      error: (error) => {
        dispatch(
          setFilesError({
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
