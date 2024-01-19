import { IBoard, INote } from "@rodez97/types-helpers";
import React, { useCallback, useMemo } from "react";
import { useNotesData } from "./useNotesData";
import { useCuttinboard } from "../cuttinboard";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { FIRESTORE } from "../utils";
import { noteConverter } from "./Note";

export interface NotesContextProps {
  notes: INote[];
  sortedNotes: INote[];
  loading: boolean;
  error?: Error;
  addNote: (note: INote) => Promise<void>;
  deleteNote: (note: INote) => Promise<void>;
  updateNote: (note: INote, updates: Partial<INote>) => Promise<void>;
}

export interface NotesProviderProps {
  children: React.ReactNode;
  selectedBoard: IBoard;
}

const NotesContext = React.createContext<NotesContextProps>(
  {} as NotesContextProps
);

export function NotesProvider({ children, selectedBoard }: NotesProviderProps) {
  const { onError } = useCuttinboard();
  const { notes, loading, error } = useNotesData(selectedBoard);

  const addNote = useCallback(
    async (note: INote) => {
      if (!selectedBoard) return;
      // Add the note to the server
      const docRef = doc(FIRESTORE, note.refPath).withConverter(noteConverter);
      // Add the note to the local state
      try {
        await setDoc(docRef, note);
      } catch (error) {
        onError(error);
      }
    },
    [onError, selectedBoard]
  );

  const deleteNote = useCallback(
    async (note: INote) => {
      if (!selectedBoard) return;
      // Delete the note from the server
      const docRef = doc(FIRESTORE, note.refPath).withConverter(noteConverter);
      try {
        await deleteDoc(docRef);
      } catch (error) {
        onError(error);
      }
    },
    [onError, selectedBoard]
  );

  const updateNote = useCallback(
    async (note: INote, updates: Partial<INote>) => {
      if (!selectedBoard) return;
      // Update the note on the server
      const docRef = doc(FIRESTORE, note.refPath).withConverter(noteConverter);
      try {
        await setDoc(docRef, updates, {
          merge: true,
        });
      } catch (error) {
        onError(error);
      }
    },
    [onError, selectedBoard]
  );

  const sortedNotes = useMemo(() => {
    return notes.sort((a, b) => a.createdAt - b.createdAt);
  }, [notes]);

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        error,
        sortedNotes,
        addNote,
        deleteNote,
        updateNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes(): NotesContextProps {
  const context = React.useContext(NotesContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}
