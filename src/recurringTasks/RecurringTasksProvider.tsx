import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  IRecurringTask,
  IRecurringTaskDoc,
} from "@cuttinboard-solutions/types-helpers";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { useCuttinboardLocation } from "../cuttinboardLocation/useCuttinboardLocation";
import { doc, onSnapshot, setDoc, Timestamp } from "firebase/firestore";
import { FIRESTORE } from "../utils/firebase";
import {
  addPeriodicTask,
  recurringTaskDocConverter,
  removePeriodicTask,
  toggleCompleted,
  updatePeriodicTask,
} from "./RecurringTask";
import { nanoid } from "nanoid";

interface RecurringTasksProviderProps {
  children: React.ReactNode;
}

interface RecurringTasksContextProps {
  recurringTaskDoc: IRecurringTaskDoc | undefined;
  loading: boolean;
  error: Error | undefined;
  addRecurringTask: (task: IRecurringTask) => Promise<void>;
  removeRecurringTask: (id: string) => Promise<void>;
  updateRecurringTask: (task: IRecurringTask, id: string) => Promise<void>;
  completeRecurringTask: (id: string) => Promise<void>;
}

export const RecurringTasksContext = createContext<RecurringTasksContextProps>(
  {} as RecurringTasksContextProps
);

export function RecurringTasksProvider({
  children,
}: RecurringTasksProviderProps) {
  const { onError, organizationKey } = useCuttinboard();
  const { location } = useCuttinboardLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [recurringTaskDoc, setRecurringTaskDoc] = useState<IRecurringTaskDoc>();

  useEffect(() => {
    if (!organizationKey) {
      return;
    }

    setLoading(true);

    const recurringTaskDocRef = doc(
      FIRESTORE,
      "Locations",
      organizationKey.locId,
      "globals",
      "recurringTasks"
    ).withConverter(recurringTaskDocConverter);

    const unsubscribe = onSnapshot(
      recurringTaskDocRef,
      (doc) => {
        const recurringTaskDoc = doc.data();
        setRecurringTaskDoc(recurringTaskDoc);
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
  }, [onError, organizationKey]);

  const addRecurringTask = useCallback(
    async (task: IRecurringTask) => {
      const id = nanoid();

      if (recurringTaskDoc) {
        const docRef = doc(FIRESTORE, recurringTaskDoc.refPath).withConverter(
          recurringTaskDocConverter
        );
        const serverUpdates = addPeriodicTask(task, id);
        try {
          await setDoc(docRef, serverUpdates, {
            merge: true,
          });
        } catch (error) {
          onError(error);
        }
        return;
      }

      try {
        const docRef = doc(
          FIRESTORE,
          "Locations",
          location.id,
          "globals",
          "recurringTasks"
        ).withConverter(recurringTaskDocConverter);

        const newRecurringTasksDoc: IRecurringTaskDoc = {
          tasks: {
            [id]: task,
          },
          createdAt: Timestamp.now().toMillis(),
          locationId: location.id,
          refPath: docRef.path,
          id,
        };

        await setDoc(docRef, newRecurringTasksDoc, { merge: true });
      } catch (error) {
        onError(error);
      }
    },
    [location.id, onError, recurringTaskDoc]
  );

  const removeRecurringTask = useCallback(
    async (id: string) => {
      if (!recurringTaskDoc) {
        return;
      }
      const docRef = doc(FIRESTORE, recurringTaskDoc.refPath).withConverter(
        recurringTaskDocConverter
      );
      const serverUpdates = removePeriodicTask(id);
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        onError(error);
      }
    },
    [onError, recurringTaskDoc]
  );

  const updateRecurringTask = useCallback(
    async (task: IRecurringTask, id: string) => {
      if (!recurringTaskDoc) {
        return;
      }
      const docRef = doc(FIRESTORE, recurringTaskDoc.refPath).withConverter(
        recurringTaskDocConverter
      );
      const serverUpdates = updatePeriodicTask(task, id);
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        onError(error);
      }
    },
    [onError, recurringTaskDoc]
  );

  const completeRecurringTask = useCallback(
    async (id: string) => {
      if (!recurringTaskDoc) {
        return;
      }
      const docRef = doc(FIRESTORE, recurringTaskDoc.refPath).withConverter(
        recurringTaskDocConverter
      );
      const serverUpdates = toggleCompleted(recurringTaskDoc, id);
      try {
        await setDoc(docRef, serverUpdates, {
          merge: true,
        });
      } catch (error) {
        onError(error);
      }
    },
    [onError, recurringTaskDoc]
  );

  return (
    <RecurringTasksContext.Provider
      value={{
        recurringTaskDoc,
        loading,
        error,
        addRecurringTask,
        removeRecurringTask,
        updateRecurringTask,
        completeRecurringTask,
      }}
    >
      {children}
    </RecurringTasksContext.Provider>
  );
}

export function useRecurringTasks(): RecurringTasksContextProps {
  const context = useContext(RecurringTasksContext);
  if (!context) {
    throw new Error(
      "useRecurringTasks must be used within a RecurringTasksProvider"
    );
  }
  return context;
}
