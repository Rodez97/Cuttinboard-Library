import { collection, query } from "firebase/firestore";
import { useMemo, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { FIRESTORE } from "../utils";
import { Utensil } from "./Utensil";
import { matchSorter } from "match-sorter";
import { orderBy } from "lodash";

export function useUtensils() {
  const [searchText, setSearchText] = useState("");
  const [data, loading, error] = useCollectionData<Utensil>(
    query(
      collection(FIRESTORE, "Locations", globalThis.locationData.id, "utensils")
    ).withConverter(Utensil.firestoreConverter)
  );

  const utensils = useMemo(() => {
    if (!data) return [];
    const items = searchText
      ? matchSorter(data, searchText, { keys: ["name"] })
      : data;
    return orderBy(items, "createdAt", "desc");
  }, [searchText, data]);

  return {
    utensils,
    searchText,
    setSearchText,
    loading,
    error,
  };
}
