import { ITask } from "../tasks/ITask";

/**
 * A checklist is a list of tasks that can be completed.
 */
export interface IChecklist {
  name: string;
  description?: string;
  tasks?: Record<string, ITask>;
  createdAt?: number;
  createdBy?: string;
  order: number;
  id: string;
}
