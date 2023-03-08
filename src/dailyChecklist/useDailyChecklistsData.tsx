import { doc } from "firebase/firestore";
import { useEffect, useRef } from "react";
import { docData } from "rxfire/firestore";
import { FIRESTORE } from "../utils";
import { checklistGroupConverter } from "../checklistsGroups/checklistGroupUtils";
import { useCuttinboardLocation } from "../cuttinboardLocation";
import { useAppDispatch, useAppSelector } from "../reduxStore/utils";
import {
  dailyChecklists,
  selectDailyChecklistsError,
  selectDailyChecklistsLoading,
  selectDailyChecklistsLoadingStatus,
} from "../checklistsGroups";

export function useDailyChecklistsData() {
  const { location } = useCuttinboardLocation();
  const reference = useRef(
    doc(
      FIRESTORE,
      "Locations",
      location.id,
      "globals",
      "dailyChecklists"
    ).withConverter(checklistGroupConverter)
  );
  const loading = useAppSelector(selectDailyChecklistsLoading);
  const loadingStatus = useAppSelector(selectDailyChecklistsLoadingStatus);
  const error = useAppSelector(selectDailyChecklistsError);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (loadingStatus === "idle") {
      // Start loading
      dispatch(dailyChecklists.actions.setChecklistLoading("pending"));
    }

    const subscription = docData(reference.current).subscribe({
      next: (checklistGroup) => {
        dispatch(dailyChecklists.actions.setChecklistGroup(checklistGroup));
      },
      error: (err) =>
        dispatch(dailyChecklists.actions.setChecklistError(err?.message)),
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { loading, error };
}
