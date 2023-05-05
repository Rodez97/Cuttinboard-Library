import { useEffect, useMemo, useReducer, useState } from "react";
import { useCuttinboard } from "../cuttinboard";
import { listReducer } from "../utils/listReducer";
import {
  BoardCollection,
  IBoard,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import {
  and,
  collectionGroup,
  onSnapshot,
  or,
  query,
  where,
} from "firebase/firestore";
import { FIRESTORE } from "../utils";
import { boardConverter } from "./boardHelpers";

export function useBoardsData(boardCollection: BoardCollection) {
  const { onError, user, organizationKey } = useCuttinboard();
  const [selectedBoardId, selectBoardId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [boards, dispatch] = useReducer(listReducer<IBoard>("id"), []);

  useEffect(() => {
    if (!organizationKey) {
      return;
    }

    const { role, locId, orgId, pos } = organizationKey;

    setLoading(true);

    const singleQuery = query(
      collectionGroup(FIRESTORE, boardCollection),
      where(`parentId`, "in", [locId, orgId])
    ).withConverter(boardConverter);

    const multiQueryOr = query(
      collectionGroup(FIRESTORE, boardCollection),
      or(
        where(`parentId`, "==", orgId),
        and(
          where(`parentId`, "==", locId),
          where(`accessTags`, "array-contains-any", [
            user.uid,
            `hostId_${user.uid}`,
            "pl_public",
            ...(pos ? pos : []),
          ])
        )
      )
    ).withConverter(boardConverter);

    const observableQuery =
      role <= RoleAccessLevels.GENERAL_MANAGER ? singleQuery : multiQueryOr;

    const unsubscribe = onSnapshot(
      observableQuery,
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
  }, [boardCollection, onError, organizationKey, user.uid]);

  const selectedBoard = useMemo(() => {
    return boards.find((note) => note.id === selectedBoardId);
  }, [boards, selectedBoardId]);

  return {
    boards,
    selectedBoard,
    selectedBoardId,
    selectBoardId,
    loading,
    error,
  };
}
