import { useEffect, useReducer, useState } from "react";
import { useCuttinboard } from "../cuttinboard";
import { listReducer } from "../utils/listReducer";
import {
  IConversation,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { FIRESTORE } from "../utils";
import { conversationsConverter } from "./conversationUtils";

export function useConversationsData(locationId?: string | undefined) {
  const { onError, organizationKey, user } = useCuttinboard();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [conversations, dispatch] = useReducer(
    listReducer<IConversation>("id"),
    []
  );

  useEffect(() => {
    setLoading(true);

    const queryRef =
      organizationKey &&
      locationId &&
      organizationKey.locId === locationId &&
      organizationKey.role <= RoleAccessLevels.GENERAL_MANAGER
        ? query(
            collection(FIRESTORE, "conversations"),
            where("locationId", "==", organizationKey.locId)
          )
        : query(
            collection(FIRESTORE, "conversations"),
            where(`members.${user.uid}`, "in", [true, false])
          );

    const unsubscribe = onSnapshot(
      queryRef.withConverter(conversationsConverter),
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
      dispatch({ type: "CLEAR" });
    };
  }, [locationId, onError, organizationKey, user.uid]);

  return { loading, error, conversations };
}
