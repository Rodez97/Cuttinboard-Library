import { useMemo } from "react";
import { useSchedule } from "./useSchedule";
import { getUpdatesCountFromArray } from "./scheduleMathHelpers";

export function useUpdatesCount() {
  const { shifts } = useSchedule();
  return useMemo(() => getUpdatesCountFromArray(shifts), [shifts]);
}
