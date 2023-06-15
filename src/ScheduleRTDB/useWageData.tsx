import { useMemo } from "react";
import { useSchedule } from "./useSchedule";
import { useCuttinboardLocation } from "../cuttinboardLocation";
import { getTotalWageData } from "@cuttinboard-solutions/types-helpers";

export function useWageData() {
  const { scheduleSettings } = useCuttinboardLocation();
  const { shifts } = useSchedule();
  return useMemo(
    () => getTotalWageData(shifts, scheduleSettings),
    [scheduleSettings, shifts]
  );
}
