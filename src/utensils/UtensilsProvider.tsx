import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { getNewUtensilChangeUpdates, utensilConverter } from "./Utensil";
import { matchSorter } from "match-sorter";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import type { IUtensil } from "@cuttinboard-solutions/types-helpers";
import { useCuttinboardLocation } from "../cuttinboardLocation/useCuttinboardLocation";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { FIRESTORE } from "../utils/firebase";
import { listReducer } from "../utils/listReducer";
import { orderBy } from "lodash-es";

interface UtensilsContextProps {
  utensils: IUtensil[];
  sortedUtensils: IUtensil[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  createUtensil: (utensil: Omit<IUtensil, "percent">) => Promise<void>;
  addUtensilChange: (
    utensil: IUtensil,
    quantity: number,
    reason?: string
  ) => Promise<void>;
  updateUtensil: (
    utensil: IUtensil,
    updates: Partial<IUtensil>
  ) => Promise<void>;
  deleteUtensil: (utensil: IUtensil) => Promise<void>;
  error: Error | undefined;
  loading: boolean;
}

interface IUtensilsProvider {
  children: ReactNode;
}

const UtensilsContext = createContext<UtensilsContextProps>(
  {} as UtensilsContextProps
);

export function UtensilsProvider({ children }: IUtensilsProvider) {
  const { location } = useCuttinboardLocation();
  const { onError } = useCuttinboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [utensils, dispatch] = useReducer(listReducer<IUtensil>("id"), []);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onSnapshot(
      query(
        collection(FIRESTORE, "Locations", location.id, "utensils")
      ).withConverter(utensilConverter),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            dispatch({ type: "ADD_ELEMENT", payload: change.doc.data() });
          }
          if (change.type === "modified") {
            dispatch({ type: "SET_ELEMENT", payload: change.doc.data() });
          }
          if (change.type === "removed") {
            dispatch({ type: "DELETE_BY_ID", payload: change.doc.id });
          }
        });
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
  }, [location.id, dispatch, onError]);

  /* `sortedUtensils` is a memoized array of `IUtensil` objects that are sorted based on the search
  query and the creation date. If there is a search query, the utensils are filtered by the search
  query using the `matchSorter` function from the `match-sorter` library. Otherwise, the utensils
  are sorted by creation date in descending order using the `orderBy` function from the `lodash`
  library. The `useMemo` hook is used to memoize the sorted utensils array so that it is only
  recomputed when the search query or the utensils array changes. */
  const sortedUtensils = useMemo(() => {
    if (!utensils) return [];
    const filtered = searchQuery
      ? matchSorter(utensils, searchQuery, {
          keys: ["name", "description"],
        })
      : utensils;
    return orderBy(filtered, "createdAt", "desc");
  }, [searchQuery, utensils]);

  /* `createUtensil` is a function that creates a new utensil in the Firestore database and updates the
  local state of the utensils list. It takes an `utensil` object as an argument, which is an object
  that contains the properties of the new utensil except for the `percent` property. The `percent`
  property is calculated based on the `currentQuantity` and `optimalQuantity` properties of the
  `utensil` object. */
  const createUtensil = useCallback(
    async (utensil: Omit<IUtensil, "percent">) => {
      const percent = Math.floor(
        (utensil.currentQuantity / utensil.optimalQuantity) * 100
      );
      const docRef = doc(FIRESTORE, utensil.refPath).withConverter(
        utensilConverter
      );
      const newUtensil: IUtensil = { ...utensil, percent };
      try {
        await setDoc(docRef, newUtensil);
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  /* `addUtensilChange` is a function that updates the quantity of a utensil and adds a reason for the
  change. It takes in three arguments: `utensil`, which is the utensil object to be updated,
  `quantity`, which is the amount by which the quantity of the utensil should be changed, and
  `reason`, which is an optional string explaining the reason for the change. */
  const addUtensilChange = useCallback(
    async (utensil: IUtensil, quantity: number, reason?: string) => {
      const docRef = doc(FIRESTORE, utensil.refPath).withConverter(
        utensilConverter
      );
      const serverUpdates = getNewUtensilChangeUpdates(
        utensil,
        quantity,
        reason
      );
      try {
        await setDoc(docRef, serverUpdates, { merge: true });
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  /* `updateUtensil` is a function that updates a utensil in the Firestore database and updates the
  local state of the utensils list. It takes in two arguments: `utensil`, which is the utensil
  object to be updated, and `updates`, which is an object containing the properties of the utensil
  to be updated. */
  const updateUtensil = useCallback(
    async (utensil: IUtensil, updates: Partial<IUtensil>) => {
      const docRef = doc(FIRESTORE, utensil.refPath).withConverter(
        utensilConverter
      );
      const updatedAt = Timestamp.now().toMillis();
      const newUtensil = { ...utensil, ...updates, updatedAt };
      const newPercent = Math.floor(
        (newUtensil.currentQuantity / newUtensil.optimalQuantity) * 100
      );
      try {
        await setDoc(
          docRef,
          {
            ...updates,
            percent: newPercent,
            updatedAt,
          },
          { merge: true }
        );
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  /* `deleteUtensil` is a function that deletes a utensil from the Firestore database and updates the
  local state of the utensils list. It takes in one argument, `utensil`, which is the utensil object
  to be deleted. The function first creates a reference to the Firestore document using the `doc`
  function from the `firebase/firestore` library. It then dispatches a `DELETE_BY_ID` action to the
  `listReducer` to remove the utensil from the local state. Finally, it attempts to delete the
  document from Firestore using the `deleteDoc` function from the `firebase/firestore` library. If
  an error occurs during the deletion process, the function dispatches an `ADD_ELEMENT` action to
  the `listReducer` to add the utensil back to the local state and calls the `onError` function from
  the `useCuttinboard` hook to handle the error. The function is memoized using the `useCallback`
  hook with the `onError` dependency. */
  const deleteUtensil = useCallback(
    async (utensil: IUtensil) => {
      const docRef = doc(FIRESTORE, utensil.refPath).withConverter(
        utensilConverter
      );
      try {
        await deleteDoc(docRef);
      } catch (error) {
        onError(error);
      }
    },
    [onError]
  );

  return (
    <UtensilsContext.Provider
      value={{
        utensils,
        sortedUtensils,
        searchQuery,
        loading,
        setSearchQuery,
        createUtensil,
        addUtensilChange,
        updateUtensil,
        deleteUtensil,
        error,
      }}
    >
      {children}
    </UtensilsContext.Provider>
  );
}

export function useUtensils() {
  const context = React.useContext(UtensilsContext);
  if (context === undefined) {
    throw new Error("useUtensils must be used within a UtensilsProvider");
  }
  return context;
}
