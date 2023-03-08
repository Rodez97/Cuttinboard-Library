import { getTasksSummary } from "./checklistUtils";
import { IChecklistGroup } from "./IChecklistGroup";

export function getChecklistsArray(checklistObject: IChecklistGroup) {
  if (!checklistObject.checklists) {
    return [];
  }
  return Object.values(checklistObject.checklists).sort((a, b) => {
    return a.order - b.order;
  });
}

/**
 * Get a summary of the completion status of all the tasks in the checklists of this group.
 */
export function getChecklistsSummary(checklistObject: IChecklistGroup) {
  // Initialize the summary object with zero values
  const summary = {
    total: 0,
    completed: 0,
  };

  const checklistsArray = getChecklistsArray(checklistObject);

  // If there are no tasks, return the empty summary object
  if (checklistsArray.length === 0) {
    return summary;
  }

  // Loop through the tasks and increment the total and completed counters
  checklistsArray.forEach((checklist) => {
    const checklistSummary = getTasksSummary(checklist);
    summary.total += checklistSummary.total;
    summary.completed += checklistSummary.completed;
  });

  return summary;
}
