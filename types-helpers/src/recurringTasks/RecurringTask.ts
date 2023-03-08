import { ByWeekday, Frequency, RRule, Weekday, WeekdayStr } from "rrule";
import dayjs from "dayjs";
import { RecurrenceObject } from "./RecurrenceObject";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import isoWeek from "dayjs/plugin/isoWeek";
import { IRecurringTaskDoc } from "./IRecurringTaskDoc";
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(isoWeek);

/**
 * The RecurringTask interface implemented by the RecurringTask class.
 */
export interface IRecurringTask {
  name: string;
  description?: string;
  recurrence: string;
  completed?: string | null;
}

/**
 * Returns the Recurrence Rule from the Recurrence Object
 * @param param Recurrence Object
 */
export function getRRuleFromObject({
  interval,
  unit,
  startingOn,
  byweekday,
  onDay,
}: RecurrenceObject): RRule {
  let recurrenceRule: RRule;

  switch (unit) {
    case Frequency.DAILY:
      recurrenceRule = new RRule({
        freq: RRule.DAILY,
        dtstart: normalDateToUTCDate(startingOn),
        interval,
      });
      break;
    case Frequency.WEEKLY:
      {
        if (!byweekday || byweekday.length === 0) {
          throw new Error("Invalid byweekday");
        }

        recurrenceRule = new RRule({
          freq: RRule.WEEKLY,
          interval,
          byweekday,
          dtstart: normalDateToUTCDate(new Date()),
        });
      }
      break;
    case Frequency.MONTHLY:
      {
        if (!onDay) {
          throw new Error("Invalid onDay");
        }

        recurrenceRule = new RRule({
          freq: RRule.MONTHLY,
          interval: interval,
          bymonthday: onDay ? [onDay] : undefined,
          dtstart: normalDateToUTCDate(new Date()),
        });
      }
      break;
    default:
      throw new Error("Invalid unit");
  }

  return recurrenceRule;
}

/**
 * Returns a Recurrence Object from the Recurrence Rule
 * @param rule Recurrence Rule
 */
export function getRRuleObjectFromRule(rule: RRule): RecurrenceObject {
  const { freq, interval, byweekday, bymonthday, dtstart } = rule.options;
  const ro: RecurrenceObject = {
    interval,
    unit: freq,
    startingOn: dtstart,
  };

  if (byweekday && Array.isArray(byweekday) && byweekday.length > 0) {
    ro.byweekday = byweekday;
  }

  if (bymonthday && Array.isArray(bymonthday) && bymonthday.length > 0) {
    ro.onDay = bymonthday[0];
  }

  return ro;
}

/**
 * Returns the Recurrence Rule from this Recurring Task
 */
export function getRecurringTaskRecurrenceRule(rt: IRecurringTask): RRule {
  if (rt.recurrence && typeof rt.recurrence === "string") {
    // Recurrence is a string
    return RRule.fromString(rt.recurrence);
  }
  // Return a default rule
  return new RRule({
    freq: RRule.DAILY,
    dtstart: dayjs().utc().toDate(),
    interval: 1,
  });
}

/**
 * Get the next occurrence of the task
 */
export function getNextOccurrence(rt: IRecurringTask): Date | null {
  const todayUTC = dayjs().utc().startOf("day").toDate(); // today in UTC
  const nextOccurrence = getRecurringTaskRecurrenceRule(rt).after(
    todayUTC,
    true
  );
  return nextOccurrence;
}

export function recurringTaskIsToday(rt: IRecurringTask): boolean {
  const todayUTC = normalDateToUTCDatePreserved(new Date());
  const nextOccurUTC = dayjs(getNextOccurrence(rt)).utc();
  return nextOccurUTC.isSame(todayUTC, "day");
}

/**
 * Task completion status
 */
export function recurringTaskIsCompleted(rt: IRecurringTask): boolean {
  return Boolean(rt.completed && rt.completed === dayjs().format("YYYY-MM-DD"));
}

/**
 * Return an array of all recurring tasks extracted from the tasks object
 */
export function getRecurringTasksArray(
  rtd: IRecurringTaskDoc
): [string, IRecurringTask][] {
  if (!rtd.tasks) {
    return [];
  }
  return Object.entries(rtd.tasks).sort((a, b) => {
    const aNextOccurrence = getNextOccurrence(a[1]) || new Date(0);
    const bNextOccurrence = getNextOccurrence(b[1]) || new Date(0);
    return aNextOccurrence.getTime() - bNextOccurrence.getTime();
  });
}

/**
 * Return an array of all recurring tasks sorted by their next occurrence
 */
export function getRecurringTasksArraySorted(
  rtd: IRecurringTaskDoc
): [string, IRecurringTask][] {
  return getRecurringTasksArray(rtd).sort((a, b) => {
    const aNextOccurrence = getNextOccurrence(a[1]) || new Date(0);
    const bNextOccurrence = getNextOccurrence(b[1]) || new Date(0);
    return aNextOccurrence.getTime() - bNextOccurrence.getTime();
  });
}

// Convert weekday to RRule weekday (0 = Monday, 6 = Sunday)
export const weekdayToRRuleWeekday = (weekday: number): Weekday => {
  switch (weekday) {
    case 0:
      return RRule.MO;
    case 1:
      return RRule.TU;
    case 2:
      return RRule.WE;
    case 3:
      return RRule.TH;
    case 4:
      return RRule.FR;
    case 5:
      return RRule.SA;
    case 6:
      return RRule.SU;
    default:
      throw new Error("Invalid weekday");
  }
};

export const rruleWeekdayToWeekday = (rruleWeekday: ByWeekday): number => {
  if (typeof rruleWeekday === "number") {
    return rruleWeekday;
  }

  switch (rruleWeekday) {
    case RRule.MO:
    case "MO":
      return 0;
    case RRule.TU:
    case "TU":
      return 1;
    case RRule.WE:
    case "WE":
      return 2;
    case RRule.TH:
    case "TH":
      return 3;
    case RRule.FR:
    case "FR":
      return 4;
    case RRule.SA:
    case "SA":
      return 5;
    case RRule.SU:
    case "SU":
      return 6;
    default:
      throw new Error("Invalid ISO Weekday");
  }
};

export const WeekdayStringToWeekday = (weekday: WeekdayStr): number => {
  switch (weekday) {
    case "MO":
      return 0;
    case "TU":
      return 1;
    case "WE":
      return 2;
    case "TH":
      return 3;
    case "FR":
      return 4;
    case "SA":
      return 5;
    case "SU":
      return 6;
    default:
      throw new Error("Invalid ISO Weekday");
  }
};

export const normalDateToUTCDate = (date: Date): Date => {
  // Convert date to UTC but set the time to 00:00:00
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  return new Date(Date.UTC(year, month, day, 0, 0, 0));
};

// Normal weekday (0 = Sunday, 6 = Saturday)
// Returns converted weekday to RRule weekday (0 = Monday, 6 = Sunday)
export const convertNormalWeekdayToRRuleWeekday = (
  normalWeekday: number
): number => {
  if (normalWeekday === 0) {
    return 6;
  }
  return normalWeekday - 1;
};

export function getStartOfWeekUTC(date: Date): Date {
  // Calculate the start of the week (Monday) for the given date
  const startOfWeek = new Date(date);

  startOfWeek.setUTCHours(0, 0, 0, 0); // set time to midnight

  const newDate = date.getUTCDate() - date.getUTCDay() + 1;

  startOfWeek.setDate(newDate); // subtract the number of days since Monday

  return startOfWeek;
}

export function getStartOfMonthUTC(date: Date): Date {
  // Calculate the start of the month for the given date
  const startOfMonth = new Date(date);

  startOfMonth.setUTCHours(0, 0, 0, 0); // set time to midnight

  startOfMonth.setUTCDate(1); // set date to 1

  return startOfMonth;
}

// Convert date to UTC but set the time to 00:00:00 and preserve the same day, month and year
export const normalDateToUTCDatePreserved = (date: Date): Date => {
  // Get the local date components
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Set the UTC date components to the local date components and set the time to 00:00:00
  return new Date(Date.UTC(year, month, day, 0, 0, 0));
};
