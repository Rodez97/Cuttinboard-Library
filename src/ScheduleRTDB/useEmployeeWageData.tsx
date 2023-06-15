import { useMemo } from "react";
import { useSchedule } from "./useSchedule";
import { getEmployeeWageData } from "./scheduleMathHelpers";
import { useCuttinboardLocation } from "../cuttinboardLocation";

export function useEmployeeWageData(employeeId: string) {
  const { scheduleSettings } = useCuttinboardLocation();
  const { shifts } = useSchedule();
  return useMemo(
    () => getEmployeeWageData(employeeId, shifts, scheduleSettings),
    [employeeId, scheduleSettings, shifts]
  );
}
