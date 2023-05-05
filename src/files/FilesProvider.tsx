import {
  IBoard,
  ICuttinboard_File,
} from "@cuttinboard-solutions/types-helpers";
import React, { useCallback, useMemo } from "react";
import { useCuttinboard } from "../cuttinboard";
import { deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { FIRESTORE } from "../utils";
import { useFilesData } from "./useFilesData";
import { cuttinboardFileConverter, getRenameData } from "./Cuttinboard_File";

export interface FilesContextProps {
  files: ICuttinboard_File[];
  sortedFiles: ICuttinboard_File[];
  loading: boolean;
  error?: Error;
  addFile: (file: ICuttinboard_File) => Promise<void>;
  deleteFile: (file: ICuttinboard_File) => Promise<void>;
  renameFile: (file: ICuttinboard_File, newName: string) => Promise<void>;
}

export interface FilesProviderProps {
  children: React.ReactNode;
  selectedBoard: IBoard;
}

const FilesContext = React.createContext<FilesContextProps>(
  {} as FilesContextProps
);

export function FilesProvider({ children, selectedBoard }: FilesProviderProps) {
  const { onError } = useCuttinboard();
  const { files, loading, error } = useFilesData(selectedBoard);

  const addFile = useCallback(
    async (file: ICuttinboard_File) => {
      // Add the file to the server
      const docRef = doc(FIRESTORE, file.refPath).withConverter(
        cuttinboardFileConverter
      );
      try {
        await setDoc(docRef, file);
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const deleteFile = useCallback(
    async (file: ICuttinboard_File) => {
      // Delete the file from the server
      const docRef = doc(FIRESTORE, file.refPath).withConverter(
        cuttinboardFileConverter
      );

      try {
        await deleteDoc(docRef);
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const renameFile = useCallback(
    async (file: ICuttinboard_File, newName: string) => {
      // Update the file on the server
      const docRef = doc(FIRESTORE, file.refPath).withConverter(
        cuttinboardFileConverter
      );

      const name = getRenameData(file, newName);

      if (!name) {
        return;
      }

      try {
        await updateDoc(docRef, {
          name,
        });
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  const sortedFiles = useMemo(() => {
    return files.sort((a, b) => a.name.localeCompare(b.name));
  }, [files]);

  return (
    <FilesContext.Provider
      value={{
        files,
        sortedFiles,
        loading,
        error,
        addFile,
        deleteFile,
        renameFile,
      }}
    >
      {children}
    </FilesContext.Provider>
  );
}

export function useFiles(): FilesContextProps {
  const context = React.useContext(FilesContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}
