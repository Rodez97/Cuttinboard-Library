import { useContext } from "react";
import { ShiftContext } from "./ScheduleProvider";

export const useSchedule = () => {
  const context = useContext(ShiftContext);

  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }

  return context;
};
