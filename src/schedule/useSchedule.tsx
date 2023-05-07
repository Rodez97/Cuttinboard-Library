import { useContext } from "react";
import { IScheduleContext, ShiftContext } from "./ScheduleProvider";

export const useSchedule = (): IScheduleContext => {
  const context = useContext(ShiftContext);

  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }

  return context;
};
