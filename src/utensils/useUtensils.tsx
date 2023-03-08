import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { utensilConverter } from "./Utensil";
import { matchSorter } from "match-sorter";
import {
  addUtensilChangeThunk,
  createUtensilThunk,
  deleteUtensilThunk,
  selectUtensilsError,
  selectUtensilsLoading,
  selectUtensilsLoadingStatus,
  setUtensils,
  setUtensilsError,
  setUtensilsLoading,
  updateUtensilThunk,
  utensilsSelectors,
} from "./utensils.slice";
import {
  useAppDispatch,
  useAppSelector,
  useAppThunkDispatch,
} from "../reduxStore/utils";
import { collectionData } from "rxfire/firestore";
import { collection, query } from "firebase/firestore";
import { FIRESTORE } from "../utils";
import { useCuttinboard } from "../cuttinboard";
import { useCuttinboardLocation } from "../cuttinboardLocation";
import { defaultIfEmpty } from "rxjs";
import { IUtensil } from "@cuttinboard-solutions/types-helpers";
import { orderBy } from "lodash";

interface IUtensilsContext {
  utensils: IUtensil[];
  sortedUtensils: IUtensil[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  createUtensil: (utensil: Omit<IUtensil, "percent">) => void;
  addUtensilChange: (
    utensil: IUtensil,
    quantity: number,
    reason?: string
  ) => void;
  updateUtensil: (utensil: IUtensil, updates: Partial<IUtensil>) => void;
  deleteUtensil: (utensil: IUtensil) => void;
  error: string | undefined;
  isLoading: boolean;
}

interface IUtensilsProvider {
  children: ReactNode;
}

const UtensilsContext = createContext<IUtensilsContext>({} as IUtensilsContext);

export function UtensilsProvider({ children }: IUtensilsProvider) {
  const { location } = useCuttinboardLocation();
  const { onError } = useCuttinboard();
  const dispatch = useAppDispatch();
  const thunkDispatch = useAppThunkDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const isLoading = useAppSelector(selectUtensilsLoading);
  const loadingStatus = useAppSelector(selectUtensilsLoadingStatus);
  const error = useAppSelector(selectUtensilsError);
  const utensils = useAppSelector(utensilsSelectors.selectAll);

  useEffect(() => {
    if (loadingStatus !== "succeeded") {
      dispatch(setUtensilsLoading("pending"));
    }

    const subscription = collectionData(
      query(
        collection(FIRESTORE, "Locations", location.id, "utensils")
      ).withConverter(utensilConverter)
    )
      .pipe(defaultIfEmpty(new Array<IUtensil>()))
      .subscribe({
        next: (utensils) => dispatch(setUtensils(utensils)),
        error: (err) => {
          dispatch(setUtensilsError(err.message));
          onError(err);
        },
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [location.id, dispatch]);

  const sortedUtensils = useMemo(() => {
    if (!utensils) return [];
    // If there is a search query, filter the utensils by the search query
    const filtered = searchQuery
      ? matchSorter(utensils, searchQuery, {
          keys: ["name", "description"],
        })
      : utensils;
    // Otherwise, sort the utensils by percent, with lowest first
    return orderBy(filtered, "createdAt", "desc");
  }, [searchQuery, utensils]);

  const createUtensil = useCallback(
    (utensil: Omit<IUtensil, "percent">) => {
      thunkDispatch(createUtensilThunk(utensil)).catch(onError);
    },
    [thunkDispatch]
  );

  const addUtensilChange = useCallback(
    (utensil: IUtensil, quantity: number, reason?: string) => {
      thunkDispatch(addUtensilChangeThunk(utensil, quantity, reason)).catch(
        onError
      );
    },
    [thunkDispatch]
  );

  const updateUtensil = useCallback(
    (utensil: IUtensil, updates: Partial<IUtensil>) => {
      thunkDispatch(updateUtensilThunk(utensil, updates)).catch(onError);
    },
    [thunkDispatch]
  );

  const deleteUtensil = useCallback(
    (utensil: IUtensil) => {
      thunkDispatch(deleteUtensilThunk(utensil)).catch(onError);
    },
    [thunkDispatch]
  );

  return (
    <UtensilsContext.Provider
      value={{
        utensils,
        sortedUtensils,
        searchQuery,
        isLoading,
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
