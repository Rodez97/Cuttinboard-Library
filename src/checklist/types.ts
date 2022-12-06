import { Timestamp } from "firebase/firestore";
import { ByWeekday, Frequency } from "rrule";

/**
 * The custom recurrence object used to create a recurring task.
 */
export type RecurrenceObject = {
  every: number;
  unit: Frequency;
  startingOn?: Date;
  weekDays?: ByWeekday[];
  onDay?: number;
  dailyType: "every" | "weekDays";
};

/**
 * Tasks are the basic unit of work in the checklist.
 */
export type Task = {
  name: string;
  status: boolean;
  createdAt: Timestamp;
  order: number;
};

/**
 * A checklist is a list of tasks that can be completed.
 */
export type Checklist = {
  name: string;
  description?: string;
  tasks?: Record<string, Task>;
  createdAt?: Timestamp;
  createdBy?: string;
  order: number;
};
