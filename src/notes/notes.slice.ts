import {
  createSlice,
  Dispatch,
  PayloadAction,
  Reducer,
  ThunkDispatch,
  AnyAction,
  EntityState,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { FIRESTORE } from "../utils";
import { keyBy } from "lodash";
import { noteConverter } from "./Note";
import { AppThunk, RootState } from "../reduxStore/utils";
import { INote } from "@cuttinboard-solutions/types-helpers";
import { LoadingStatus } from "../models";

export interface NotesBoardEntry extends LoadingStatus {
  id: string;
  notes: EntityState<INote>;
}

const notesBoardEntryAdapter = createEntityAdapter<NotesBoardEntry>();
const notesAdapter = createEntityAdapter<INote>({
  sortComparer: (a, b) => a.createdAt - b.createdAt,
});

export const addNoteThunk =
  (boardId: string, note: INote): AppThunk<Promise<void>> =>
  async (dispatch) => {
    // Add the note to the server
    const docRef = doc(FIRESTORE, note.refPath).withConverter(noteConverter);
    // Add the note to the local state
    dispatch(
      upsertNote({
        boardId,
        note,
      })
    );
    try {
      await setDoc(docRef, note);
    } catch (error) {
      dispatch(
        deleteNote({
          boardId,
          noteId: note.id,
        })
      );
      throw error;
    }
  };

export const deleteNoteThunk =
  (boardId: string, note: INote): AppThunk<Promise<void>> =>
  async (dispatch) => {
    // Delete the note from the server
    const docRef = doc(FIRESTORE, note.refPath).withConverter(noteConverter);

    // Delete the note from the local state
    dispatch(
      deleteNote({
        boardId,
        noteId: note.id,
      })
    );
    try {
      await deleteDoc(docRef);
    } catch (error) {
      dispatch(
        upsertNote({
          boardId,
          note,
        })
      );
      throw error;
    }
  };

export const updateNoteThunk =
  (
    boardId: string,
    note: INote,
    updates: Partial<INote>
  ): AppThunk<Promise<void>> =>
  async (dispatch) => {
    // Update the note on the server
    const docRef = doc(FIRESTORE, note.refPath).withConverter(noteConverter);

    // Update the note in the local state
    dispatch(
      updateNote({
        boardId,
        noteId: note.id,
        updates,
      })
    );
    try {
      await setDoc(docRef, updates, {
        merge: true,
      });
    } catch (error) {
      dispatch(
        upsertNote({
          boardId,
          note,
        })
      );
      throw error;
    }
  };

const notesSlice = createSlice({
  name: "notes",
  initialState: notesBoardEntryAdapter.getInitialState(),
  reducers: {
    setNotes(
      state,
      action: PayloadAction<{
        boardId: string;
        notes: INote[];
      }>
    ) {
      const { boardId, notes } = action.payload;
      const notesBoardEntry = state.entities[boardId];
      if (!notesBoardEntry) {
        notesBoardEntryAdapter.addOne(state, {
          id: boardId,
          notes: notesAdapter.getInitialState({
            ids: notes.map((m) => m.id),
            entities: keyBy(notes, (m) => m.id),
          }),
          loading: "succeeded",
        });
      } else {
        const { loading, error } = notesBoardEntry;
        if (loading === "failed" || error) {
          notesBoardEntry.error = undefined;
        }
        notesBoardEntry.loading = "succeeded";
        notesAdapter.setAll(notesBoardEntry.notes, notes);
      }
    },
    upsertNote(
      state,
      action: PayloadAction<{
        boardId: string;
        note: INote;
      }>
    ) {
      const { boardId, note } = action.payload;
      const notesBoardEntry = state.entities[boardId];
      if (!notesBoardEntry) {
        console.warn("No notes board entry found for boardId: ", boardId);
        return;
      }
      notesAdapter.upsertOne(notesBoardEntry.notes, note);
    },
    deleteNote(
      state,
      action: PayloadAction<{
        boardId: string;
        noteId: string;
      }>
    ) {
      const { boardId, noteId } = action.payload;
      const notesBoardEntry = state.entities[boardId];
      if (!notesBoardEntry) {
        return;
      }
      notesAdapter.removeOne(notesBoardEntry.notes, noteId);
    },
    updateNote(
      state,
      action: PayloadAction<{
        boardId: string;
        noteId: string;
        updates: Partial<INote>;
      }>
    ) {
      const { boardId, noteId, updates } = action.payload;
      const notesBoardEntry = state.entities[boardId];
      if (!notesBoardEntry) {
        return;
      }
      notesAdapter.updateOne(notesBoardEntry.notes, {
        id: noteId,
        changes: updates,
      });
    },
    addNote(
      state,
      action: PayloadAction<{
        boardId: string;
        note: INote;
      }>
    ) {
      const { boardId, note } = action.payload;
      const notesBoardEntry = state.entities[boardId];
      if (!notesBoardEntry) {
        notesBoardEntryAdapter.addOne(state, {
          id: boardId,
          notes: notesAdapter.getInitialState({
            ids: [note.id],
            entities: { [note.id]: note },
          }),
          loading: "succeeded",
        });
      } else {
        notesAdapter.addOne(notesBoardEntry.notes, note);
      }
    },
    setNotesLoading(
      state,
      action: PayloadAction<{
        boardId: string;
        loading: LoadingStatus["loading"];
      }>
    ) {
      const { boardId, loading } = action.payload;
      const notesBoardEntry = state.entities[boardId];
      if (!notesBoardEntry) {
        notesBoardEntryAdapter.addOne(state, {
          id: boardId,
          notes: notesAdapter.getInitialState({
            ids: [],
            entities: {},
          }),
          loading,
        });
      } else {
        notesBoardEntry.loading = loading;
      }
    },
    setNotesError(
      state,
      action: PayloadAction<{
        boardId: string;
        error: LoadingStatus["error"];
      }>
    ) {
      const { boardId, error } = action.payload;
      const notesBoardEntry = state.entities[boardId];
      if (!notesBoardEntry) {
        notesBoardEntryAdapter.addOne(state, {
          id: boardId,
          notes: notesAdapter.getInitialState({
            ids: [],
            entities: {},
          }),
          loading: "failed",
          error,
        });
      } else {
        notesBoardEntry.loading = "failed";
        notesBoardEntry.error = error;
      }
    },
  },
});

export const {
  setNotes,
  upsertNote,
  deleteNote,
  updateNote,
  addNote,
  setNotesError,
  setNotesLoading,
} = notesSlice.actions;

type NotesActions =
  | ReturnType<typeof setNotes>
  | ReturnType<typeof deleteNote>
  | ReturnType<typeof upsertNote>
  | ReturnType<typeof updateNote>
  | ReturnType<typeof addNote>
  | ReturnType<typeof setNotesError>
  | ReturnType<typeof setNotesLoading>;

export const notesReducer: Reducer<
  EntityState<NotesBoardEntry>,
  NotesActions
> = notesSlice.reducer;

export const useNotesDispatch = () => useDispatch<Dispatch<NotesActions>>();

export const useNotesThunkDispatch = () =>
  useDispatch<ThunkDispatch<EntityState<NotesBoardEntry>, void, AnyAction>>();

export const notesBoardEntriesSelectors =
  notesBoardEntryAdapter.getSelectors<RootState>((state) => state.notes);

export const notesSelectors = notesAdapter.getSelectors();

export const noteSelector = (boardId: string) =>
  createSelector(
    (state: RootState) => notesBoardEntriesSelectors.selectById(state, boardId),
    (board) => (board ? notesSelectors.selectAll(board.notes) : [])
  );

export const noteLoadingSelector = (boardId: string) =>
  createSelector(
    (state: RootState) => notesBoardEntriesSelectors.selectById(state, boardId),
    (board) =>
      board ? board.loading === "pending" || board.loading === "idle" : false
  );

export const noteErrorSelector = (boardId: string) =>
  createSelector(
    (state: RootState) => notesBoardEntriesSelectors.selectById(state, boardId),
    (board) => (board ? board.error : undefined)
  );

export const noteLoadingStatusSelector = (boardId: string) =>
  createSelector(
    (state: RootState) => notesBoardEntriesSelectors.selectById(state, boardId),
    (board) => (board ? board.loading : "idle")
  );
