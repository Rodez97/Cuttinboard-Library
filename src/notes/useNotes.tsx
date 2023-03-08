import { IBoard, INote } from "@cuttinboard-solutions/types-helpers";
import { useCallback, useMemo } from "react";
import { useCuttinboard } from "../cuttinboard";
import { useAppSelector, useAppThunkDispatch } from "../reduxStore/utils";
import {
  addNoteThunk,
  deleteNoteThunk,
  noteErrorSelector,
  noteLoadingSelector,
  noteSelector,
  updateNoteThunk,
} from "./notes.slice";

export function useNotes(board: IBoard) {
  const thunkDispatch = useAppThunkDispatch();
  const { onError } = useCuttinboard();
  const [notesSelector, notesLoadingSelector, notesErrorSelector] = useMemo(
    () => [
      noteSelector(board.id),
      noteLoadingSelector(board.id),
      noteErrorSelector(board.id),
    ],
    [board.id]
  );
  const notes = useAppSelector(notesSelector);
  const loading = useAppSelector(notesLoadingSelector);
  const error = useAppSelector(notesErrorSelector);

  const addNote = useCallback(
    (note: INote) => {
      thunkDispatch(addNoteThunk(board.id, note)).catch(onError);
    },
    [board.id, thunkDispatch]
  );

  const deleteNote = useCallback(
    (note: INote) => {
      thunkDispatch(deleteNoteThunk(board.id, note)).catch(onError);
    },
    [board.id, thunkDispatch]
  );

  const updateNote = useCallback(
    (note: INote, updates: Partial<INote>) => {
      thunkDispatch(updateNoteThunk(board.id, note, updates)).catch(onError);
    },
    [board.id, thunkDispatch]
  );

  return {
    notes,
    addNote,
    deleteNote,
    updateNote,
    loading,
    error,
  };
}
