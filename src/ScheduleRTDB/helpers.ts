import dayjs from "dayjs";
import { Timestamp } from "firebase/firestore";
import isoWeek from "dayjs/plugin/isoWeek.js";
import {
  IShift,
  Shift,
  generateOrderFactor,
} from "@cuttinboard-solutions/types-helpers";
import { AUTH } from "../utils/firebase";
dayjs.extend(isoWeek);

/**
 * This function creates new shift elements based on a given shift, dates, and weekdays to apply to.
 * @param {IShift} shift - An object representing a shift, with properties such as start time, end
 * time, and other details.
 * @param {dayjs.Dayjs[]} dates - An array of dayjs objects representing the dates for which the shift
 * needs to be created.
 * @param {number[]} applyToWeekDays - `applyToWeekDays` is an array of numbers representing the ISO
 * weekday numbers (1-7, where 1 is Monday and 7 is Sunday) on which the shift should be applied. For
 * example, if `applyToWeekDays` is `[1, 3, 5]
 * @returns an array of IShift objects.
 */
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
    const shiftId = `${isoWeekDay}-${shift.id}`;
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
      locationQuery: `${rest.weekId}-${rest.locationId}`,
      employeeQuery: `${rest.weekId}-${rest.employeeId}`,
      employeeLocationQuery: `${rest.employeeId}-${rest.locationId}`,
      weekOrderFactor: generateOrderFactor(rest.weekId),
    });
  }
  return newShifts;
}

/**
 * This function copies properties from a source object to a destination object with a specified prefix
 * added to the keys.
 * @param {T} source - The source object from which properties will be copied.
 * @param destination - The object where the properties from the source object will be copied to, with
 * a prefix added to their keys.
 * @param {string} prefix - The prefix parameter is a string that will be added to the beginning of
 * each key in the source object before it is copied to the destination object.
 */
export function copyPropertiesWithPrefix<T extends Record<string, unknown>>(
  source: T,
  destination: Record<string, unknown>,
  prefix: string
): void {
  for (const key in source) {
    destination[`${prefix}/${key}`] = source[key];
  }
}
