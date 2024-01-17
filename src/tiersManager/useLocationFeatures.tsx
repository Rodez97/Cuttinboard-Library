import { useCallback } from "react";
import { useCuttinboardLocation } from "../cuttinboardLocation";

type Features =
  | "Employees"
  | "Schedule"
  | "Messages"
  | "Utensils"
  | "Notes"
  | "Tasks"
  | "Files"
  | "DailyChecklist"
  | "MyShifts";

/**
 * Checks if the current user has access to a feature, based on the tier of their location and the feature they are trying to access.
 * - If the feature is not available to the user, it will return false (recommend to upgrade tier to access feature)
 */
export function useLocationFeatures() {
  const { location } = useCuttinboardLocation();

  return useCallback(
    (feature: Features) => {
      if (location.tier === "pro") return true;
      if (location.tier === "enterprise") return true;
      if (location.tier === "basic") {
        switch (feature) {
          case "Employees":
          case "Schedule":
          case "MyShifts":
            return true;
          case "Messages":
          case "Utensils":
          case "Notes":
          case "Tasks":
          case "Files":
          case "DailyChecklist":
            return false;
          default:
            return false;
        }
      }
    },
    [location.tier]
  );
}
