import dayjs from "dayjs";
import { Timestamp } from "firebase/firestore";
import isoWeek from "dayjs/plugin/isoWeek.js";
import { AUTH } from "../utils/firebase";
import { nanoid } from "nanoid";
import { IShift, Shift, generateOrderFactor } from "@rodez97/types-helpers";
dayjs.extend(isoWeek);

export function createShiftElement(
  shift: IShift,
  dates: dayjs.Dayjs[],
  applyToWeekDays: number[]
): IShift[] {
  if (!AUTH.currentUser) {
    throw new Error("User not authenticated");
  }

  const newShifts: IShift[] = [];

  const { start, end, ...rest } = shift;
  const baseStart = Shift.toDate(start);
  const baseEnd = Shift.toDate(end);
  for (const isoWeekDay of applyToWeekDays) {
    const shiftId = nanoid();
    const column = dates.find((c) => c.isoWeekday() === isoWeekDay);

    if (!column) {
      console.log("No column found for", isoWeekDay);
      continue;
    }

    const newStart = column.hour(baseStart.hour()).minute(baseStart.minute());
    const newEnd = column.hour(baseEnd.hour()).minute(baseEnd.minute());
    const normalizedEnd = newEnd.isBefore(newStart)
      ? newEnd.add(1, "day")
      : newEnd;
    newShifts.push({
      ...rest,
      start: Shift.toString(newStart.toDate()),
      end: Shift.toString(normalizedEnd.toDate()),
      updatedAt: Timestamp.now().toMillis(),
      status: "draft",
      id: shiftId,
      weekOrderFactor: generateOrderFactor(rest.weekId),
    });
  }
  return newShifts;
}
