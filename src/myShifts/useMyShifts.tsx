import { useEffect, useMemo, useState } from "react";
import { combineLatest, map } from "rxjs";
import { DATABASE } from "../utils";
import {
  useAppDispatch,
  useAppSelector,
  useAppThunkDispatch,
} from "../reduxStore/utils";
import { useCuttinboard } from "../cuttinboard";
import {
  changeMyShiftsLoading,
  myShiftsSelectors,
  selectMyShiftsError,
  selectMyShiftsLoading,
  setMyShifts,
  setMyShiftsError,
} from "./myShifts.slice";
import { selectLocation } from "../cuttinboardLocation/locationSelectors";
import { removeScheduleBadgesThunk } from "../notifications";
import { equalTo, orderByChild, query, ref } from "firebase/database";
import { listVal } from "rxfire/database";
import {
  getShiftBaseData,
  IShift,
  WEEKFORMAT,
} from "@cuttinboard-solutions/types-helpers";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { groupBy, upperFirst } from "lodash";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);

export function useMyShifts() {
  const location = useAppSelector(selectLocation);
  const { user, onError } = useCuttinboard();
  const dispatch = useAppDispatch();
  const thunkDispatch = useAppThunkDispatch();
  const [onlyLocation, setOnlyLocation] = useState(false);
  const loading = useAppSelector(selectMyShiftsLoading);
  const error = useAppSelector(selectMyShiftsError);
  const myShifts = useAppSelector(myShiftsSelectors.selectAll);

  const groupedByDay = useMemo(() => {
    const onlyPublished = myShifts.filter(
      (shift) => shift.status === "published"
    );

    const byLocation =
      location && onlyLocation
        ? onlyPublished.filter((shift) => shift.locationId === location.id)
        : onlyPublished;

    const grouped = groupBy(byLocation, (shf) =>
      upperFirst(getShiftBaseData(shf).start.format("dddd, MMMM DD, YYYY"))
    );

    return Object.entries(grouped);
  }, [location, myShifts, onlyLocation]);

  useEffect(() => {
    const currentWeekId = dayjs().format(WEEKFORMAT);
    const nextWeekId = dayjs().add(1, "week").format(WEEKFORMAT);

    dispatch(
      changeMyShiftsLoading({
        loading: "pending",
      })
    );

    const scheduleRefs = [currentWeekId, nextWeekId].map((weekId) =>
      query(
        ref(DATABASE, `shifts/${weekId}`),
        orderByChild("employeeId"),
        equalTo(user.uid)
      )
    );

    const observables$ = combineLatest(
      scheduleRefs.map((scheduleRef) => listVal<IShift>(scheduleRef))
    ).pipe(
      map((snapshots) =>
        snapshots.reduce<IShift[]>((acc, shifts) => {
          if (!shifts || !shifts.length) {
            return acc;
          }
          return [...acc, ...shifts];
        }, [])
      )
    );

    const subscription = observables$.subscribe({
      next: (myShifts) => dispatch(setMyShifts(myShifts)),
      error: (err) => {
        dispatch(setMyShiftsError(err?.message));
        onError(err);
      },
    });

    return () => {
      subscription.unsubscribe();
      thunkDispatch(removeScheduleBadgesThunk());
    };
  }, [dispatch, onError, thunkDispatch, user.uid]);

  return {
    loading,
    error,
    groupedByDay,
    onlyLocation,
    setOnlyLocation,
    myShifts,
  };
}
