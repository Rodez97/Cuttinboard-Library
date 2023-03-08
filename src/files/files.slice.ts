import { ICuttinboard_File } from "@cuttinboard-solutions/types-helpers";
import {
  createSlice,
  Dispatch,
  PayloadAction,
  ThunkDispatch,
  AnyAction,
  EntityState,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";
import { deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { keyBy } from "lodash";
import { useDispatch } from "react-redux";
import { LoadingStatus } from "../models";
import { AppThunk, RootState } from "../reduxStore/utils";
import { FIRESTORE } from "../utils";
import { cuttinboardFileConverter, getRenameData } from "./Cuttinboard_File";

export interface DrawerEntry extends LoadingStatus {
  id: string;
  files: EntityState<ICuttinboard_File>;
}

const drawersAdapter = createEntityAdapter<DrawerEntry>();
const filesAdapter = createEntityAdapter<ICuttinboard_File>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export const addFileThunk =
  (boardId: string, file: ICuttinboard_File): AppThunk<Promise<void>> =>
  async (dispatch) => {
    // Add the file to the server
    const docRef = doc(FIRESTORE, file.refPath).withConverter(
      cuttinboardFileConverter
    );
    // Add the file to the local state
    dispatch(
      upsertFile({
        boardId,
        file,
      })
    );
    try {
      await setDoc(docRef, file);
    } catch (error) {
      dispatch(
        deleteFile({
          boardId,
          fileId: file.id,
        })
      );
      throw error;
    }
  };

export const deleteFileThunk =
  (boardId: string, file: ICuttinboard_File): AppThunk<Promise<void>> =>
  async (dispatch) => {
    // Delete the file from the server
    const docRef = doc(FIRESTORE, file.refPath).withConverter(
      cuttinboardFileConverter
    );

    // Delete the file from the local state
    dispatch(
      deleteFile({
        boardId,
        fileId: file.id,
      })
    );
    try {
      await deleteDoc(docRef);
    } catch (error) {
      dispatch(
        upsertFile({
          boardId,
          file,
        })
      );
      throw error;
    }
  };

export const renameFileThunk =
  (
    boardId: string,
    file: ICuttinboard_File,
    newName: string
  ): AppThunk<Promise<void>> =>
  async (dispatch) => {
    // Update the file on the server
    const docRef = doc(FIRESTORE, file.refPath).withConverter(
      cuttinboardFileConverter
    );

    const name = getRenameData(file, newName);

    if (!name) {
      return;
    }

    // Update the file in the local state
    dispatch(
      renameFile({
        boardId,
        fileId: file.id,
        newName: name,
      })
    );
    try {
      await updateDoc(docRef, {
        name,
      });
    } catch (error) {
      dispatch(
        upsertFile({
          boardId,
          file,
        })
      );
      throw error;
    }
  };

const filesSlice = createSlice({
  name: "files",
  initialState: drawersAdapter.getInitialState(),
  reducers: {
    setFiles(
      state,
      action: PayloadAction<{
        boardId: string;
        files: ICuttinboard_File[];
      }>
    ) {
      const { boardId, files } = action.payload;
      const drawerEntry = state.entities[boardId];
      if (!drawerEntry) {
        drawersAdapter.addOne(state, {
          id: boardId,
          files: filesAdapter.getInitialState({
            ids: files.map((m) => m.id),
            entities: keyBy(files, (m) => m.id),
          }),
          loading: "succeeded",
        });
      } else {
        const { loading, error } = drawerEntry;
        if (loading === "failed" || error) {
          drawerEntry.error = undefined;
        }
        drawerEntry.loading = "succeeded";
        filesAdapter.setAll(drawerEntry.files, files);
      }
    },
    upsertFile(
      state,
      action: PayloadAction<{
        boardId: string;
        file: ICuttinboard_File;
      }>
    ) {
      const { boardId, file } = action.payload;
      const drawerEntry = state.entities[boardId];
      if (!drawerEntry) {
        console.warn("No drawer entry found for boardId: " + boardId);
        return;
      }
      filesAdapter.upsertOne(drawerEntry.files, file);
    },
    deleteFile(
      state,
      action: PayloadAction<{
        boardId: string;
        fileId: string;
      }>
    ) {
      const { boardId, fileId } = action.payload;
      const drawerEntry = state.entities[boardId];
      if (drawerEntry) {
        filesAdapter.removeOne(drawerEntry.files, fileId);
      }
    },
    renameFile(
      state,
      action: PayloadAction<{
        boardId: string;
        fileId: string;
        newName: string;
      }>
    ) {
      const { boardId, fileId, newName } = action.payload;
      const drawerEntry = state.entities[boardId];
      if (drawerEntry) {
        const file = drawerEntry.files.entities[fileId];
        if (file) {
          filesAdapter.updateOne(drawerEntry.files, {
            id: fileId,
            changes: {
              name: newName,
            },
          });
        }
      }
    },
    setFilesLoading(
      state,
      action: PayloadAction<{
        boardId: string;
        loading: LoadingStatus["loading"];
      }>
    ) {
      const { boardId, loading } = action.payload;
      const drawerEntry = state.entities[boardId];
      if (!drawerEntry) {
        drawersAdapter.addOne(state, {
          id: boardId,
          files: filesAdapter.getInitialState({
            ids: [],
            entities: {},
          }),
          loading,
        });
      } else {
        drawerEntry.loading = loading;
      }
    },
    setFilesError(
      state,
      action: PayloadAction<{
        boardId: string;
        error: LoadingStatus["error"];
      }>
    ) {
      const { boardId, error } = action.payload;
      const drawerEntry = state.entities[boardId];
      if (!drawerEntry) {
        drawersAdapter.addOne(state, {
          id: boardId,
          files: filesAdapter.getInitialState({
            ids: [],
            entities: {},
          }),
          loading: "failed",
          error,
        });
      } else {
        drawerEntry.loading = "failed";
        drawerEntry.error = error;
      }
    },
  },
});

export const {
  setFiles,
  upsertFile,
  deleteFile,
  renameFile,
  setFilesLoading,
  setFilesError,
} = filesSlice.actions;

type FilesActions =
  | ReturnType<typeof setFiles>
  | ReturnType<typeof deleteFile>
  | ReturnType<typeof upsertFile>
  | ReturnType<typeof renameFile>
  | ReturnType<typeof setFilesLoading>
  | ReturnType<typeof setFilesError>;

export const filesReducer = filesSlice.reducer;

export const useFilesDispatch = () => useDispatch<Dispatch<FilesActions>>();

export const useFilesThunkDispatch = () =>
  useDispatch<ThunkDispatch<EntityState<DrawerEntry>, void, AnyAction>>();

export const drawerSelectors = drawersAdapter.getSelectors<RootState>(
  (state) => state.files
);

export const fileSelectors = filesAdapter.getSelectors();

export const fileSelector = (boardId: string) =>
  createSelector(
    (state: RootState) => drawerSelectors.selectById(state, boardId),
    (drawer) => (drawer ? fileSelectors.selectAll(drawer.files) : [])
  );

export const fileLoadingSelector = (boardId: string) =>
  createSelector(
    (state: RootState) => drawerSelectors.selectById(state, boardId),
    (drawer) =>
      drawer ? drawer.loading === "pending" || drawer.loading === "idle" : false
  );

export const fileErrorSelector = (boardId: string) =>
  createSelector(
    (state: RootState) => drawerSelectors.selectById(state, boardId),
    (drawer) => (drawer ? drawer.error : undefined)
  );

export const fileLoadingStatusSelector = (boardId: string) =>
  createSelector(
    (state: RootState) => drawerSelectors.selectById(state, boardId),
    (drawer) => (drawer ? drawer.loading : "idle")
  );
