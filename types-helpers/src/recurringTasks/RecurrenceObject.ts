import { ByWeekday, Frequency } from "rrule";

/**
 * The custom recurrence object used to create a recurring task.
 */
export type RecurrenceObject = {
  interval: number;
  unit: Frequency;
  startingOn: Date;
  byweekday?: ByWeekday[];
  onDay?: number;
};
