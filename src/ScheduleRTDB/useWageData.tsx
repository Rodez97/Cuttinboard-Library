import { useMemo } from "react";
import { useSchedule } from "./useSchedule";
import { useCuttinboardLocation } from "../cuttinboardLocation";
import { getTotalWageData } from "@rodez97/types-helpers";

export function useWageData() {
  const { scheduleSettings } = useCuttinboardLocation();
  const { shifts } = useSchedule();
  return useMemo(
    () => getTotalWageData(shifts, scheduleSettings),
    [scheduleSettings, shifts]
  );
}
