import { useEffect } from "react";
import { DATABASE } from "../utils";
import {
  setScheduleData,
  setEmployeeShiftsError,
  setEmployeeShiftsLoading,
} from "./schedule.slice";
import { useAppDispatch } from "../reduxStore/utils";
import { useCuttinboard } from "../cuttinboard";
import { useCuttinboardLocation } from "../cuttinboardLocation";
import {
  createDefaultScheduleDoc,
  IScheduleDoc,
  IShift,
} from "@cuttinboard-solutions/types-helpers";
import { equalTo, orderByChild, query, ref } from "firebase/database";
import { listVal, objectVal } from "rxfire/database";
import { combineLatest } from "rxjs";

export function useScheduleData(weekId: string) {
  const { onError } = useCuttinboard();
  const { location } = useCuttinboardLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setEmployeeShiftsLoading("pending"));

    const shiftsRef = query(
      ref(DATABASE, `shifts/${weekId}`),
      orderByChild("locationId"),
      equalTo(location.id)
    );

    const scheduleRef = ref(DATABASE, `schedule/${weekId}/${location.id}`);

    const shifts$ = listVal<IShift>(shiftsRef);

    const schedule$ = objectVal<IScheduleDoc | null>(scheduleRef);

    const subscription = combineLatest([schedule$, shifts$]).subscribe({
      next: ([schedule, shifts]) => {
        dispatch(
          setScheduleData({
            weekId,
            shifts: shifts || [],
            summary: schedule || createDefaultScheduleDoc(weekId, location.id),
          })
        );
      },
      error: (error) => {
        dispatch(setEmployeeShiftsError(error.message));
        onError(error);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, location.id, onError, weekId]);
}
