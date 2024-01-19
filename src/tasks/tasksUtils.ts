import { getTasksArray, IChecklistGroup, ITask } from "@rodez97/types-helpers";
import { deleteField, Timestamp } from "firebase/firestore";
import { set } from "lodash-es";

export function updateTask(checklistId: string, taskKey: string, name: string) {
  const serverUpdates = {
    checklists: {
      [checklistId]: {
        tasks: {
          [taskKey]: {
            name,
          },
        },
      },
    },
  };
  return serverUpdates;
}

/**
 * Update the status of a task.
 * @param newStatus The new status of the task.
 */
export function changeTaskStatus(
  checklistId: string,
  taskKey: string,
  newStatus: boolean
) {
  const serverUpdates = {
    checklists: {
      [checklistId]: {
        tasks: {
          [taskKey]: {
            status: newStatus,
          },
        },
      },
    },
  };

  return serverUpdates;
}

/**
 * Add a new task to a checklist.
 * @param taskKey The key of the task to add.
 * @param name The task to add.
 */
export function addChecklistTask(
  baseObject: IChecklistGroup,
  checklistId: string,
  taskKey: string,
  name: string
) {
  const checklist = baseObject.checklists?.[checklistId];
  if (!checklist) {
    throw new Error("There is no checklist with this ID");
  }
  // Check if the task exists
  if (checklist.tasks?.[taskKey]) {
    throw new Error("There is already a task with this ID");
  }

  const tasksArray = getTasksArray(checklist);

  const order = tasksArray.length + 1;

  const newTask: ITask = {
    order,
    name: name,
    status: false,
    createdAt: Timestamp.now().toMillis(),
    id: taskKey,
  };

  const serverUpdate = {
    checklists: {
      [checklistId]: {
        tasks: {
          [taskKey]: newTask,
        },
      },
    },
  };

  return serverUpdate;
}

/**
 * Delete a task from a checklist.
 * @param taskKey The key of the task to delete.
 */
export function removeChecklistTask(
  baseObject: IChecklistGroup,
  checklistId: string,
  taskKey: string
) {
  const checklist = baseObject.checklists?.[checklistId];
  if (!checklist) {
    throw new Error("There is no checklist with this ID");
  }
  // Check if the task exists
  if (!checklist.tasks?.[taskKey]) {
    throw new Error("There is no task with this ID");
  }

  const serverUpdates = {
    checklists: {
      [checklistId]: {
        tasks: {
          [taskKey]: deleteField(),
        },
      },
    },
  };

  // Create a copy of the objects array
  const updatedOrder = getTasksArray(checklist);

  // Find the index of the object to delete
  const index = updatedOrder.findIndex((task) => task.id === taskKey);

  // Remove the object at the specified index
  updatedOrder.splice(index, 1);

  // Update the order attribute of the remaining objects in the array
  updatedOrder.forEach((task, index) => {
    set(
      serverUpdates,
      `checklists.${checklistId}.tasks.${task.id}.order`,
      index + 1
    );
  });

  return serverUpdates;
}

/**
 * Update the order of a task in a checklist.
 * @param taskKey The key of the task to move.
 */
export function reorderChecklistTask(
  baseObject: IChecklistGroup,
  checklistId: string,
  taskKey: string,
  toIndex: number
) {
  const checklist = baseObject.checklists?.[checklistId];
  if (!checklist) {
    throw new Error("There is no checklist with this ID");
  }
  // Check if the task exists
  if (!checklist.tasks?.[taskKey]) {
    throw new Error("There is no task with this ID");
  }
  const serverUpdates: Partial<IChecklistGroup> = {};

  // Create a copy of the objects array
  const updatedOrder = getTasksArray(checklist);

  // Find the index of the object to delete
  const fromIndex = updatedOrder.findIndex((task) => task.id === taskKey);

  // Swap the objects at the specified indices
  const [removedObject] = updatedOrder.splice(fromIndex, 1);
  updatedOrder.splice(toIndex, 0, removedObject);

  // Update the order attribute of the moved objects and the other objects in the array
  updatedOrder.forEach((task, index) => {
    set(
      serverUpdates,
      `checklists.${checklistId}.tasks.${task.id}.order`,
      index + 1
    );
  });

  return serverUpdates;
}
