import { ICuttinboard_File } from "@cuttinboard-solutions/types-helpers";
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { STORAGE } from "../utils";

export const cuttinboardFileConverter = {
  toFirestore(object: ICuttinboard_File): DocumentData {
    const { refPath, id, ...objectToSave } = object;
    return objectToSave;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<ICuttinboard_File>,
    options: SnapshotOptions
  ): ICuttinboard_File {
    const { id, ref } = value;
    const rawData = value.data(options);
    return {
      ...rawData,
      id,
      refPath: ref.path,
    };
  },
};

export async function getFileUrl(file: ICuttinboard_File) {
  const storageRef = ref(STORAGE, file.storagePath);
  const url = await getDownloadURL(storageRef);
  return url;
}

/**
 * Updates the name of this file
 * @param newName The new name for this file
 */
export function getRenameData(file: ICuttinboard_File, newName: string) {
  const filenameMath = file.name.match(/^(.*?)\.([^.]*)?$/);

  if (!filenameMath) {
    // If the filename doesn't match the regex, just throw an error
    throw new Error("Invalid filename");
  }

  const oldName = filenameMath[1];
  const extension = filenameMath[2];
  if (newName === oldName) {
    // If the new name is the same as the old name, just return
    return;
  }
  // Otherwise, update the name
  const name = `${newName}.${extension}`;
  return name;
}
