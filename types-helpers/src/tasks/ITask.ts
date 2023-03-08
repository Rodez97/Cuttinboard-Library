/**
 * Tasks are the basic unit of work in the checklist.
 */
export interface ITask {
  name: string;
  status: boolean;
  createdAt: number;
  order: number;
  id: string;
}
