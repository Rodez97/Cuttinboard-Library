import dayjs from "dayjs";
import { Timestamp } from "firebase/firestore";
import { AUTH } from "../utils";
import isoWeek from "dayjs/plugin/isoWeek";
import { IShift, Shift } from "@cuttinboard-solutions/types-helpers";
dayjs.extend(isoWeek);

export function createShiftElement(
  shift: IShift,
  dates: dayjs.Dayjs[],
  applyToWeekDays: number[]
): Record<string, IShift> {
  if (!AUTH.currentUser) {
    throw new Error("User not authenticated");
  }

  // New shift record
  const newShifts: Record<string, IShift> = {};

  const { start, end, ...rest } = shift;
  const baseStart = Shift.toDate(start);
  const baseEnd = Shift.toDate(end);
  // Create a new shift for each date
  for (const isoWeekDay of applyToWeekDays) {
    const shiftId = `${isoWeekDay}-${shift.id}`;
    const column = dates.find((c) => c.isoWeekday() === isoWeekDay);

    if (!column) {
      console.log("No column found for", isoWeekDay);
      continue;
    }

    // Adjust the start and end dates to the correct weekday
    const newStart = column.hour(baseStart.hour()).minute(baseStart.minute());
    const newEnd = column.hour(baseEnd.hour()).minute(baseEnd.minute());
    // If end time is before start time, add a day to the end time
    const normalizedEnd = newEnd.isBefore(newStart)
      ? newEnd.add(1, "day")
      : newEnd;
    // Create the new shift
    newShifts[shiftId] = {
      ...rest,
      start: Shift.toString(newStart.toDate()),
      end: Shift.toString(normalizedEnd.toDate()),
      updatedAt: Timestamp.now().toMillis(),
      status: "draft",
      id: shiftId,
    };
  }
  return newShifts;
}

export function copyPropertiesWithPrefix<T extends Record<string, unknown>>(
  source: T,
  destination: Record<string, unknown>,
  prefix: string
): void {
  for (const key in source) {
    destination[`${prefix}/${key}`] = source[key];
  }
}
