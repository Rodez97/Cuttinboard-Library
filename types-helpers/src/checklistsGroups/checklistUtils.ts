import { ITask } from "../tasks/ITask";
import { IChecklist } from "./IChecklist";

export function sortChecklistOrTask(
  data: (IChecklist | ITask)[],
  mode: "asc" | "desc"
) {
  if (!data) {
    return;
  }
  return data.sort((a, b) => {
    return mode === "asc" ? a.order - b.order : b.order - a.order;
  });
}

export function getTasksArray(checklist: IChecklist) {
  if (!checklist.tasks) {
    return [];
  }
  return Object.values(checklist.tasks).sort((a, b) => {
    return a.order - b.order;
  });
}

/**
 * Return the summary of the checklist
 */
export function getTasksSummary(checklist: IChecklist) {
  // Initialize the summary object with zero values
  const summary = {
    total: 0,
    completed: 0,
  };

  const tasksArray = getTasksArray(checklist);

  // If there are no tasks, return the empty summary object
  if (tasksArray.length === 0) {
    return summary;
  }

  // Loop through the tasks and increment the total and completed counters
  tasksArray.forEach((task) => {
    summary.total++;
    if (task.status) {
      summary.completed++;
    }
  });

  // Return the summary object
  return summary;
}
