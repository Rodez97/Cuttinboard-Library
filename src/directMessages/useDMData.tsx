import { IDirectMessage } from "@rodez97/types-helpers";
import { useEffect, useReducer, useState } from "react";
import { useCuttinboard } from "../cuttinboard";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { FIRESTORE } from "../utils";
import { listReducer } from "../utils/listReducer";
import { dmConverter } from "./dmUtils";

const dmSorter = (a: IDirectMessage, b: IDirectMessage): number => {
  if (a.recentMessage && b.recentMessage) {
    return b.recentMessage - a.recentMessage;
  } else if (a.recentMessage) {
    return -1;
  } else if (b.recentMessage) {
    return 1;
  } else {
    return 0;
  }
};

export function useDMData() {
  const { user, onError } = useCuttinboard();
  const [directMessages, dispatch] = useReducer(
    listReducer<IDirectMessage>("id", dmSorter),
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    setLoading(true);

    const queryRef = query(
      collection(FIRESTORE, `directMessages`),
      where(`members.${user.uid}._id`, "==", user.uid)
    ).withConverter(dmConverter);

    const unsubscribe = onSnapshot(
      queryRef,
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
  }, [onError, user.uid]);

  return { directMessages, loading, error };
}
