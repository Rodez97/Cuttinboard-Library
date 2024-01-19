import {
  IChecklist,
  IChecklistGroup,
  getChecklistsArray,
} from "@rodez97/types-helpers";
import {
  FirestoreError,
  Timestamp,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FIRESTORE } from "../utils";
import {
  addChecklist,
  checklistGroupConverter,
  removeChecklist,
  reorderChecklists,
  resetAllTasks,
  updateChecklist,
} from "./checklistGroupUtils";
import { useCuttinboard } from "../cuttinboard";
import { useCuttinboardLocation } from "../cuttinboardLocation";
import {
  addChecklistTask,
  changeTaskStatus,
  removeChecklistTask,
  reorderChecklistTask,
  updateTask,
} from "../tasks";

interface ChecklistProviderProps {
  children: React.ReactNode;
  checklistDocument: "locationChecklists" | "dailyChecklists";
}

interface ChecklistContextProps {
  checklistGroup: IChecklistGroup | undefined;
  loading: boolean;
  error: Error | undefined;
  updateChecklistTask: (
    checklistKey: string,
    taskKey: string,
    name: string
  ) => Promise<void>;
  changeChecklistTaskStatus: (
    checklistKey: string,
    taskKey: string,
    newStatus: boolean
  ) => Promise<void>;
  addTaskToChecklist: (
    checklistKey: string,
    taskKey: string,
    name: string
  ) => Promise<void>;
  removeTaskFromChecklist: (
    checklistKey: string,
    taskKey: string
  ) => Promise<void>;
  reorderTaskPositions: (
    checklistKey: string,
    taskKey: string,
    toIndex: number
  ) => Promise<void>;
  resetAllChecklistTasks: () => Promise<void>;
  deleteChecklist: (checklistKey: string) => Promise<void>;
  addNewChecklist: (
    id: string | number,
    newTask?:
      | {
          id: string;
          name: string;
        }
      | undefined
  ) => Promise<void>;
  reorderChecklistsPosition: (
    checklistKey: string,
    toIndex: number
  ) => Promise<void>;
  updateChecklistsData: (
    checklistKey: string,
    newData: Partial<{
      name: string;
      description: string;
    }>
  ) => Promise<void>;
  deleteAllChecklists: () => Promise<void>;
  checklistsArray: IChecklist[];
}

const ChecklistContext = React.createContext({} as ChecklistContextProps);

export function ChecklistProvider({
  children,
  checklistDocument,
}: ChecklistProviderProps) {
  const { user, onError, organizationKey } = useCuttinboard();
  const { location } = useCuttinboardLocation();
  const [checklistGroup, setChecklistGroup] = useState<IChecklistGroup>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError>();

  useEffect(() => {
    if (!organizationKey) {
      return;
    }

    setLoading(true);
    const reference = doc(
      FIRESTORE,
      "Locations",
      organizationKey.locId,
      "globals",
      checklistDocument
    ).withConverter(checklistGroupConverter);

    const unsubscribe = onSnapshot(
      reference,
      (doc) => {
        const checklistGroup = doc.data();
        setChecklistGroup(checklistGroup);
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
    };
  }, [checklistDocument, onError, organizationKey]);

  const updateChecklistTask = useCallback(
    async (checklistKey: string, taskKey: string, name: string) => {
      if (!checklistGroup) {
        return;
      }

      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const serverUpdates = updateTask(checklistKey, taskKey, name);
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        onError(error);
      }
    },
    [checklistGroup, onError]
  );

  const changeChecklistTaskStatus = useCallback(
    async (checklistKey: string, taskKey: string, newStatus: boolean) => {
      if (!checklistGroup) {
        return;
      }

      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const serverUpdates = changeTaskStatus(checklistKey, taskKey, newStatus);
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        onError(error);
      }
    },
    [checklistGroup, onError]
  );

  const addTaskToChecklist = useCallback(
    async (checklistKey: string, taskKey: string, name: string) => {
      if (!checklistGroup) {
        return;
      }

      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const serverUpdate = addChecklistTask(
        checklistGroup,
        checklistKey,
        taskKey,
        name
      );
      try {
        await setDoc(docRef, serverUpdate, {
          merge: true,
        });
      } catch (error) {
        onError(error);
      }
    },
    [checklistGroup, onError]
  );

  const removeTaskFromChecklist = useCallback(
    async (checklistKey: string, taskKey: string) => {
      if (!checklistGroup) {
        return;
      }
      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const serverUpdates = removeChecklistTask(
        checklistGroup,
        checklistKey,
        taskKey
      );
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        onError(error);
      }
    },
    [checklistGroup, onError]
  );

  const reorderTaskPositions = useCallback(
    async (checklistKey: string, taskKey: string, toIndex: number) => {
      if (!checklistGroup) {
        return;
      }
      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const serverUpdates = reorderChecklistTask(
        checklistGroup,
        checklistKey,
        taskKey,
        toIndex
      );
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        onError(error);
      }
    },
    [checklistGroup, onError]
  );

  const resetAllChecklistTasks = useCallback(async () => {
    if (!checklistGroup) {
      return;
    }
    const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
      checklistGroupConverter
    );
    const updates = resetAllTasks(checklistGroup);
    if (!updates) {
      return;
    }
    try {
      await setDoc(docRef, updates, {
        merge: true,
      });
    } catch (error) {
      onError(error);
    }
  }, [checklistGroup, onError]);

  const deleteChecklist = useCallback(
    async (checklistKey: string) => {
      if (!checklistGroup) {
        return;
      }
      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const serverUpdates = removeChecklist(checklistGroup, checklistKey);
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        onError(error);
      }
    },
    [checklistGroup, onError]
  );

  const addNewChecklist = useCallback(
    async (id: string | number, newTask?: { id: string; name: string }) => {
      if (checklistGroup) {
        const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
          checklistGroupConverter
        );
        const serverUpdates = addChecklist(
          checklistGroup,
          id.toString(),
          newTask
        );
        try {
          await setDoc(docRef, serverUpdates, {
            merge: true,
          });
        } catch (error) {
          onError(error);
        }
      } else {
        const docRef = doc(
          FIRESTORE,
          "Locations",
          location.id,
          "globals",
          checklistDocument
        ).withConverter(checklistGroupConverter);
        // If we don't have a checklist, we're creating a new one
        const newChecklistGroup: IChecklistGroup = {
          locationId: location.id,
          checklists: {
            [id.toString()]: {
              name: `Task List #1`,
              createdAt: Timestamp.now().toMillis(),
              createdBy: user.uid,
              order: 1,
              id: id.toString(),
            },
          },
          createdAt: Timestamp.now().toMillis(),
          refPath: docRef.path,
          id: checklistDocument,
        };
        try {
          await setDoc(docRef, newChecklistGroup);
        } catch (error) {
          onError(error);
        }
      }
    },
    [checklistGroup, onError, location.id, user.uid, checklistDocument]
  );

  const reorderChecklistsPosition = useCallback(
    async (checklistKey: string, toIndex: number) => {
      if (!checklistGroup) {
        return;
      }
      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const serverUpdates = reorderChecklists(
        checklistGroup,
        checklistKey,
        toIndex
      );
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        onError(error);
      }
    },
    [checklistGroup, onError]
  );

  const updateChecklistsData = useCallback(
    async (
      checklistKey: string,
      newData: Partial<{
        name: string;
        description: string;
      }>
    ) => {
      if (!checklistGroup) {
        return;
      }
      const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
        checklistGroupConverter
      );
      const serverUpdate = updateChecklist(checklistKey, newData);
      try {
        await setDoc(docRef, serverUpdate, {
          merge: true,
        });
      } catch (error) {
        onError(error);
      }
    },
    [checklistGroup, onError]
  );

  const deleteAllChecklists = useCallback(async () => {
    if (!checklistGroup) {
      return;
    }
    const docRef = doc(FIRESTORE, checklistGroup.refPath).withConverter(
      checklistGroupConverter
    );
    try {
      await setDoc(
        docRef,
        {
          checklists: {},
        },
        {
          merge: true,
        }
      );
    } catch (error) {
      onError(error);
    }
  }, [checklistGroup, onError]);

  const checklistsArray = useMemo(() => {
    if (!checklistGroup) {
      return [];
    }
    return getChecklistsArray(checklistGroup);
  }, [checklistGroup]);

  return (
    <ChecklistContext.Provider
      value={{
        checklistsArray,
        checklistGroup,
        addNewChecklist,
        deleteChecklist,
        reorderChecklistsPosition,
        updateChecklistsData,
        deleteAllChecklists,
        updateChecklistTask,
        changeChecklistTaskStatus,
        addTaskToChecklist,
        removeTaskFromChecklist,
        resetAllChecklistTasks,
        reorderTaskPositions,
        loading,
        error,
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
}

export const useChecklist = (): ChecklistContextProps => {
  const context = useContext(ChecklistContext);
  if (!context) {
    throw new Error("useChecklist must be used within a ChecklistProvider");
  }
  return context;
};
