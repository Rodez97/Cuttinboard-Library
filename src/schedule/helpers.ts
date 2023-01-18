import dayjs from "dayjs";
import { serverTimestamp, WithFieldValue } from "firebase/firestore";
import { FirebaseSignature } from "../models";
import { AUTH } from "../utils";
import { IShift, Shift } from "./Shift";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

/**
 * Gets a date by year and ISO week number.
 *
 * @param year The year.
 * @param isoWeekNo The ISO week number.
 * @returns The date corresponding to the given year, week, and week day.
 */
export function weekToDate(year: number, isoWeekNo: number): dayjs.Dayjs {
  return dayjs().year(year).month(1).isoWeek(isoWeekNo).startOf("isoWeek");
}

export function parseWeekId(weekId: string): {
  year: number;
  week: number;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
} {
  const weekInfo = weekId.split("-");
  const week = parseInt(weekInfo[1]);
  const year = parseInt(weekInfo[2]);
  const start = weekToDate(year, week);
  const end = start.endOf("isoWeek");
  return { year, week, start, end };
}

export function minutesToTextDuration(totalMinutes: number): string {
  // Divide the total number of minutes by 60 to get the number of hours
  const hours = Math.floor(totalMinutes / 60);

  // Use the remainder from the division to get the number of minutes that are left over
  let minutes: string | number = totalMinutes % 60;

  // Use the toFixed method to round down the number of minutes to the nearest whole number
  minutes = minutes.toFixed(0);

  // Use string concatenation to combine the number of hours and minutes into a string in the desired format
  return `${hours}h ${minutes}min`;
}

export function createShiftElement(
  shift: IShift,
  dates: dayjs.Dayjs[],
  applyToWeekDays: number[],
  id: string
): Record<string, WithFieldValue<IShift & FirebaseSignature>> {
  if (!AUTH.currentUser) {
    throw new Error("User not authenticated");
  }

  // New shift record
  const newShifts: Record<
    string,
    WithFieldValue<IShift & FirebaseSignature>
  > = {};

  const { start, end, ...rest } = shift;
  const baseStart = Shift.toDate(start);
  const baseEnd = Shift.toDate(end);
  // Create a new shift for each date
  for (const isoWeekDay of applyToWeekDays) {
    const shiftId = `${isoWeekDay}-${id}`;
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: AUTH.currentUser.uid,
      status: "draft",
    };
  }
  return newShifts;
}
