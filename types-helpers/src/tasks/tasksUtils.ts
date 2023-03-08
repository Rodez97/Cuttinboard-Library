import { ITask } from "./ITask";

export function sortTasks(tasks: Record<string, ITask>) {
  if (!tasks) {
    return;
  }
  const sortedTasks: Record<string, ITask> = {};
  const taskKeys = Object.keys(tasks);
  taskKeys.sort((a, b) => {
    const taskA = tasks[a];
    const taskB = tasks[b];
    return taskA.order - taskB.order;
  });
  taskKeys.forEach((key) => {
    sortedTasks[key] = tasks[key];
  });
  return sortedTasks;
}
