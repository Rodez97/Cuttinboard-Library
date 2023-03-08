import { useEffect } from "react";
import { DATABASE } from "../utils";
import {
  setEmployeeShifts,
  setEmployeeShiftsError,
  setEmployeeShiftsLoading,
} from "./schedule.slice";
import { useAppDispatch, useAppSelector } from "../reduxStore/utils";
import { useCuttinboard } from "../cuttinboard";
import { selectScheduleLoadingStatus } from "./scheduleSelectors";
import { useCuttinboardLocation } from "../cuttinboardLocation";
import { createDefaultScheduleDoc } from "@cuttinboard-solutions/types-helpers";
import { ref } from "firebase/database";
import { object } from "rxfire/database";

export function useScheduleData(weekId: string) {
  const { onError } = useCuttinboard();
  const { location } = useCuttinboardLocation();
  const dispatch = useAppDispatch();
  const loadingStatus = useAppSelector(selectScheduleLoadingStatus);

  useEffect(() => {
    if (loadingStatus !== "succeeded") {
      dispatch(setEmployeeShiftsLoading("pending"));
    }

    const scheduleRef = ref(
      DATABASE,
      `scheduleData/${location.organizationId}/${location.id}/${weekId}`
    );

    const schedule$ = object(scheduleRef);

    const subscription = schedule$.subscribe({
      next: (schedule) => {
        const scheduleDocumentExists = schedule.snapshot.exists();
        const scheduleDocument = schedule.snapshot.val();

        if (!scheduleDocumentExists || !scheduleDocument) {
          dispatch(
            setEmployeeShifts({
              weekId,
              schedule: {
                shifts: {},
                summary: createDefaultScheduleDoc(weekId),
              },
            })
          );
          return;
        }

        dispatch(
          setEmployeeShifts({
            schedule: scheduleDocument,
            weekId,
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
  }, [weekId]);
}
