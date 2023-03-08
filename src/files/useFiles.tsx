import {
  IBoard,
  ICuttinboard_File,
} from "@cuttinboard-solutions/types-helpers";
import { useCallback, useMemo } from "react";
import { useCuttinboard } from "../cuttinboard";
import { useAppSelector, useAppThunkDispatch } from "../reduxStore/utils";
import {
  addFileThunk,
  deleteFileThunk,
  fileErrorSelector,
  fileLoadingSelector,
  fileSelector,
  renameFileThunk,
} from "./files.slice";

export function useFiles(board: IBoard) {
  const thunkDispatch = useAppThunkDispatch();
  const { onError } = useCuttinboard();
  const [filesSelector, filesLoadingSelector, filesErrorSelector] = useMemo(
    () => [
      fileSelector(board.id),
      fileLoadingSelector(board.id),
      fileErrorSelector(board.id),
    ],
    [board.id]
  );
  const files = useAppSelector(filesSelector);
  const loading = useAppSelector(filesLoadingSelector);
  const error = useAppSelector(filesErrorSelector);

  const addFile = useCallback(
    (file: ICuttinboard_File) => {
      thunkDispatch(addFileThunk(board.id, file)).catch(onError);
    },
    [board.id, thunkDispatch]
  );

  const deleteFile = useCallback(
    (file: ICuttinboard_File) => {
      thunkDispatch(deleteFileThunk(board.id, file)).catch(onError);
    },
    [board.id, thunkDispatch]
  );

  const renameFile = useCallback(
    (file: ICuttinboard_File, newName: string) => {
      thunkDispatch(renameFileThunk(board.id, file, newName)).catch(onError);
    },
    [board.id, thunkDispatch]
  );

  return {
    files,
    addFile,
    deleteFile,
    renameFile,
    loading,
    error,
  };
}
