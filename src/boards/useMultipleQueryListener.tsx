import { Query } from "firebase/firestore";
import { useEffect } from "react";
import { collectionData } from "rxfire/firestore";
import { combineLatest, map } from "rxjs";
import {
  makeSelectBoardLoadingStatus,
  selectBoardActions,
} from "./createBoardSlice";
import { useAppDispatch, useAppSelector } from "../reduxStore/utils";
import { useCuttinboard } from "../cuttinboard";
import {
  BoardCollection,
  IBoard,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";

export function useBoardQueries(
  boardCollection: BoardCollection,
  ...queries: Query<IBoard>[]
) {
  const dispatch = useAppDispatch();
  const loadingStatus = useAppSelector(
    makeSelectBoardLoadingStatus(boardCollection)
  );
  const { onError } = useCuttinboard();

  useEffect(() => {
    if (loadingStatus !== "succeeded") {
      dispatch(selectBoardActions(boardCollection).setBoardsLoading("pending"));
    }

    const observables$ = queries.map((query) => collectionData(query));
    const combined$ = combineLatest(observables$).pipe(
      map((boards) => boards.flat())
    );
    const subscription = combined$.subscribe({
      next: (boards) =>
        dispatch(selectBoardActions(boardCollection).setBoards(boards)),
      error: (err) => {
        dispatch(
          selectBoardActions(boardCollection).setBoardsError(err?.message)
        );
        onError(err);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queries]);
}

export function useBoardQuery(
  query: Query<IBoard>,
  boardCollection: BoardCollection
) {
  const dispatch = useAppDispatch();
  const loadingStatus = useAppSelector(
    makeSelectBoardLoadingStatus(boardCollection)
  );
  const { onError } = useCuttinboard();

  useEffect(() => {
    if (loadingStatus !== "succeeded") {
      dispatch(selectBoardActions(boardCollection).setBoardsLoading("pending"));
    }

    const subscription = collectionData(query).subscribe({
      next: (boards) =>
        dispatch(selectBoardActions(boardCollection).setBoards(boards)),
      error: (err) => {
        dispatch(
          selectBoardActions(boardCollection).setBoardsError(err?.message)
        );
        onError(err);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [query]);
}

export const useBoardsData = (
  role: RoleAccessLevels,
  boardCollection: BoardCollection,
  singleQuery: Query<IBoard>,
  ...queries: Query<IBoard>[]
) =>
  role <= RoleAccessLevels.GENERAL_MANAGER
    ? useBoardQuery(singleQuery, boardCollection)
    : useBoardQueries(boardCollection, ...queries);

export const getBoardsObservable = (
  role: RoleAccessLevels,
  singleQuery: Query<IBoard>,
  multiQuery: Query<IBoard>[]
) =>
  role <= RoleAccessLevels.GENERAL_MANAGER
    ? collectionData(singleQuery)
    : combineLatest(multiQuery.map((query) => collectionData(query))).pipe(
        map((boards) => boards.flat())
      );
