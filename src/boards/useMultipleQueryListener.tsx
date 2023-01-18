import { Query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Board } from "./Board";
import { collectionData } from "rxfire/firestore";
import { combineLatest } from "rxjs";
import { RoleAccessLevels } from "../utils";
import { useCollectionData } from "react-firebase-hooks/firestore";

type MultipleQueryListenerHook = [Board[], boolean, Error | null];

export function useMultipleQueryListener(
  ...queries: Query<Board>[]
): MultipleQueryListenerHook {
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    const observables$ = queries.map((query) => collectionData(query));
    const combined$ = combineLatest(observables$);
    const subscription = combined$.subscribe((boards) => {
      setBoards(boards.flat());
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Use the useMemo hook to memoize the array of values returned by the hook
  const resArray = useMemo<MultipleQueryListenerHook>(
    () => [boards, false, null],
    [boards]
  );

  return resArray;
}

export const useBoardsData = (
  role: RoleAccessLevels,
  singleQuery: Query<Board>,
  ...queries: Query<Board>[]
) =>
  role <= RoleAccessLevels.GENERAL_MANAGER
    ? useCollectionData<Board>(singleQuery)
    : useMultipleQueryListener(...queries);
