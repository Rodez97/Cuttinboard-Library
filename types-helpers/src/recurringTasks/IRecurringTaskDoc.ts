import { IRecurringTask } from "./RecurringTask";

/**
 * The basic interface for a RecurringTaskDoc document.
 */
export interface IRecurringTaskDoc {
  locationId: string;
  tasks?: {
    [key: string]: IRecurringTask;
  };
  createdAt: number;
  updatedAt?: number;
  refPath: string;
  id: string;
}
