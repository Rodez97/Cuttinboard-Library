import { useEffect, useMemo, useReducer, useState } from "react";
import { useCuttinboard } from "../cuttinboard";
import messageReducer from "./messageReducer";
import {
  FirestoreError,
  collection,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { FIRESTORE } from "../utils";
import { messagesConverter } from "./types";

export function useMessagesData(messagesPath: string, initialLoadSize: number) {
  const { onError } = useCuttinboard();
  const [noMoreMessages, setNoMoreMessages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError>();
  const [msgs, dispatch] = useReducer(messageReducer, []);

  useEffect(() => {
    setLoading(true);

    const baseRef = collection(FIRESTORE, messagesPath);

    const realtimeQuery = query(
      baseRef,
      orderBy("createdAt"),
      limitToLast(initialLoadSize)
    ).withConverter(messagesConverter);

    const unsubscribe = onSnapshot(
      realtimeQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            dispatch({ type: "ADD_MESSAGE", payload: change.doc.data() });
          }
          if (change.type === "modified") {
            dispatch({ type: "SET_MESSAGE", payload: change.doc.data() });
          }
          if (change.type === "removed") {
            dispatch({
              type: "DELETE_MESSAGE",
              payload: {
                _id: change.doc.id,
              },
            });
          }
        });

        setLoading(false);
      },
      (error) => {
        setError(error);
        onError(error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      setNoMoreMessages(false);
      dispatch({ type: "CLEAR_MESSAGES" });
    };
  }, [initialLoadSize, messagesPath, onError]);

  const messages = useMemo(
    () => msgs.sort((a, b) => b.createdAt - a.createdAt),
    [msgs]
  );

  return {
    messages,
    loading,
    error,
    noMoreMessages,
    setNoMoreMessages,
    dispatch,
  };
}
