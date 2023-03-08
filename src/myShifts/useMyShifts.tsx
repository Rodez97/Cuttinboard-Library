import { useEffect } from "react";
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
  selectMyShiftsError,
  selectMyShiftsGroupedByDay,
  selectMyShiftsLoading,
  setMyShifts,
  setMyShiftsError,
} from "./myShifts.slice";
import { selectLocation } from "../cuttinboardLocation/locationSelectors";
import { removeScheduleBadgesThunk } from "../notifications";
import { equalTo, orderByChild, query, ref } from "firebase/database";
import { object } from "rxfire/database";
import {
  IShift,
  WEEKFORMAT,
  WeekSchedule,
} from "@cuttinboard-solutions/types-helpers";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);

export function useMyShifts() {
  const location = useAppSelector(selectLocation);
  if (!location) {
    throw new Error("No active location");
  }
  const { user, onError } = useCuttinboard();
  const dispatch = useAppDispatch();
  const thunkDispatch = useAppThunkDispatch();
  const loading = useAppSelector(selectMyShiftsLoading);
  const error = useAppSelector(selectMyShiftsError);
  const groupedByDay = useAppSelector(selectMyShiftsGroupedByDay);

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
        ref(
          DATABASE,
          `scheduleData/${location.organizationId}/${location.id}/${weekId}/shifts/${user.uid}`
        ),
        orderByChild("status"),
        equalTo("published")
      )
    );

    const observables$ = combineLatest(
      scheduleRefs.map((scheduleRef) => object(scheduleRef))
    ).pipe(
      map((snapshots) =>
        snapshots.reduce<IShift[]>((acc, { snapshot }) => {
          if (!snapshot.exists() || !snapshot.val()) {
            return acc;
          }
          const data: WeekSchedule["shifts"][string] = snapshot.val();
          const shifts = Object.values(data);
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
      thunkDispatch(
        removeScheduleBadgesThunk(location.organizationId, location.id)
      );
    };
  }, [dispatch, location.id, location.organizationId, user.uid]);

  return { loading, error, groupedByDay };
}
