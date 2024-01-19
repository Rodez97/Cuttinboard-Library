import { useCallback, useEffect, useMemo, useState } from "react";
import { IShift, getShiftBaseData } from "@rodez97/types-helpers";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { FIRESTORE } from "../utils/firebase";
import type { MyShiftsContextProps } from "./MyShiftsProvider";
import { useNotifications } from "../notifications";
import { collection, query, where } from "firebase/firestore";
import { shiftConverter } from "../ScheduleRTDB";
import { collectionData } from "rxfire/firestore";
import { defaultIfEmpty } from "rxjs";
import { groupBy, upperFirst } from "lodash-es";

export function useMyShiftsData(
  weekId: string,
  locationId?: string
): MyShiftsContextProps {
  const { user, onError } = useCuttinboard();
  const [onlyLocation, setOnlyLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [myShifts, setMyShifts] = useState<IShift[]>([]);
  const { removeScheduleBadges } = useNotifications();

  const groupedByDay = useMemo(() => {
    const onlyPublished = myShifts.filter(
      (shift) => shift.status === "published"
    );

    const byLocation =
      locationId && onlyLocation
        ? onlyPublished.filter((shift) => shift.locationId === locationId)
        : onlyPublished;

    const grouped = groupBy(byLocation, (shf) =>
      upperFirst(getShiftBaseData(shf).start.format("YYYY-MM-DD"))
    );

    return Object.entries(grouped);
  }, [locationId, myShifts, onlyLocation]);

  const handleShiftsChange = useCallback((shifts: IShift[] | null) => {
    setMyShifts(shifts ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);

    const shiftsRef = query(
      collection(FIRESTORE, "shifts"),
      where("weekId", "==", weekId),
      where("employeeId", "==", user.uid)
    ).withConverter(shiftConverter);

    const shifts$ = collectionData(shiftsRef).pipe(
      defaultIfEmpty(new Array<IShift>())
    );

    const shiftsSubscription = shifts$.subscribe({
      next: (shifts: IShift[]) => {
        setMyShifts(shifts);
        setLoading(false);
      },
      error: (error) => {
        setError(error);
        onError(error);
        setLoading(false);
      },
    });

    return () => {
      shiftsSubscription.unsubscribe();
      removeScheduleBadges();
    };
  }, [handleShiftsChange, onError, removeScheduleBadges, user.uid, weekId]);

  return {
    loading,
    error,
    groupedByDay,
    onlyLocation,
    setOnlyLocation,
    myShifts,
  };
}
