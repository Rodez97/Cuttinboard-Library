import { useEffect, useMemo, useReducer, useState } from "react";
import { useCuttinboard } from "../cuttinboard";
import { listReducer } from "../utils/listReducer";
import {
  BoardCollection,
  IBoard,
  PrivacyLevel,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import {
  QueryFilterConstraint,
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
      where(`details.parentId`, "in", [locId, orgId])
    ).withConverter(boardConverter);

    const multiQueryConstraints: QueryFilterConstraint[] = [
      where(`details.admins`, "array-contains", user.uid),
      where("details.privacyLevel", "==", PrivacyLevel.PUBLIC),
      and(
        where("details.privacyLevel", "==", PrivacyLevel.PRIVATE),
        where(`details.members`, "array-contains", user.uid)
      ),
    ];

    if (pos && pos.length > 0) {
      multiQueryConstraints.push(
        and(
          where("details.privacyLevel", "==", PrivacyLevel.POSITIONS),
          where(`details.position`, "in", pos)
        )
      );
    }

    const multiQueryOr = query(
      collectionGroup(FIRESTORE, boardCollection),
      and(
        where(`details.parentId`, "in", [orgId, locId]),
        or(...multiQueryConstraints)
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
