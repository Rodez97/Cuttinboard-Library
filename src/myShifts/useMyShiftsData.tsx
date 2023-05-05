import { useCallback, useEffect, useMemo, useState } from "react";
import { equalTo, orderByChild, query, ref } from "firebase/database";
import { listVal } from "rxfire/database";
import { getShiftBaseData, IShift } from "@cuttinboard-solutions/types-helpers";
import { groupBy, upperFirst } from "lodash";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { DATABASE } from "../utils/firebase";
import { MyShiftsContextProps } from "./MyShiftsProvider";
import { useNotifications } from "../notifications";

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
      ref(DATABASE, "shifts"),
      orderByChild("employeeQuery"),
      equalTo(`${weekId}-${user.uid}`)
    );

    const shifts$ = listVal<IShift>(shiftsRef);

    const shiftsSubscription = shifts$.subscribe({
      next: handleShiftsChange,
      error: (error) => {
        setError(error);
        onError(error);
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
