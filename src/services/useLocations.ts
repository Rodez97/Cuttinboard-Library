import { collection, query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Firestore } from "../firebase";
import { LocationConverter } from "../models/Location";
import { useCuttinboard } from "./Cuttinboard";

export const useLocations = () => {
  const { user } = useCuttinboard();
  const [locations, locationsLoading, locationsError] = useCollectionData(
    query(
      collection(Firestore, "Locations"),
      where("members", "array-contains", user.uid)
    ).withConverter(LocationConverter)
  );

  return { locations, locationsLoading, locationsError };
};
