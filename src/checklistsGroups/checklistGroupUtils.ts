import {
  getChecklistsArray,
  IChecklist,
  IChecklistGroup,
} from "@cuttinboard-solutions/types-helpers";
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  deleteField,
  Timestamp,
} from "firebase/firestore";
import { isEmpty, set, unset } from "lodash";
import { AUTH } from "../utils/firebase";

export const checklistGroupConverter = {
  toFirestore(object: IChecklistGroup): DocumentData {
    const { refPath, id, ...objectToSave } = object;
    return objectToSave;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IChecklistGroup>,
    options: SnapshotOptions
  ): IChecklistGroup {
    const { id, ref } = value;
    const rawData = value.data(options);
    return {
      ...rawData,
      id,
      refPath: ref.path,
    };
  },
};

/**
 * Reset the status of all the tasks in all the checklists of this group.
 */
export function resetAllTasks(checklistObject: IChecklistGroup) {
  // Create a new object with all the tasks set to false
  const serverUpdates: Partial<IChecklistGroup> = {};
  const localUpdates = checklistObject;

  if (!checklistObject.checklists || isEmpty(checklistObject.checklists)) {
    // If there are no sections, return
    return null;
  }

  for (const checklistKey in checklistObject.checklists) {
    const checklist = checklistObject.checklists[checklistKey];
    if (!checklist.tasks || isEmpty(checklist.tasks)) {
      // If there are no tasks in the section, skip it
      continue;
    }
    for (const taskKey in checklist.tasks) {
      set(
        serverUpdates,
        `checklists.${checklistKey}.tasks.${taskKey}.status`,
        false
      );
      set(
        localUpdates,
        `checklists.${checklistKey}.tasks.${taskKey}.status`,
        false
      );
    }
  }

  return {
    serverUpdates,
    localUpdates,
  };
}

/**
 * Remove a checklist from this group.
 * @param checklistKey The key of the checklist to remove.
 */
export function removeChecklist(
  checklistObject: IChecklistGroup,
  checklistKey: string
) {
  // Check if the section exists
  if (!checklistObject.checklists?.[checklistKey]) {
    throw new Error("There is no section with this ID");
  }
  const serverUpdates: Partial<IChecklistGroup> = {};
  set(serverUpdates, `checklists.${checklistKey}`, deleteField());

  const localUpdates = checklistObject;
  unset(localUpdates, `checklists.${checklistKey}`);

  // Create a copy of the objects array
  const updatedOrder = getChecklistsArray(checklistObject);

  // Find the index of the object to delete
  const index = updatedOrder.findIndex(
    (checklist) => checklist.id === checklistKey
  );

  // Remove the object at the specified index
  updatedOrder.splice(index, 1);

  // Update the order attribute of the remaining objects in the array
  updatedOrder.forEach((checklist, index) => {
    set(serverUpdates, `checklists.${checklist.id}.order`, index + 1);
    set(localUpdates, `checklists.${checklist.id}.order`, index + 1);
  });

  return {
    serverUpdates,
    localUpdates,
  };
}

/**
 * Add a new checklist to this group.
 * @param newChecklistKey The key of the checklist to add.
 * @param newTask If provided, a new task will be added to the checklist in the same operation.
 */
export function addChecklist(
  checklistObject: IChecklistGroup,
  newChecklistKey: string,
  newTask?: { id: string; name: string }
) {
  // Check if the section exists
  if (checklistObject.checklists?.[newChecklistKey]) {
    throw new Error("There is already a checklist with this ID");
  }

  if (!AUTH.currentUser) {
    throw new Error("You must be logged in to add a section");
  }

  const order = checklistObject.checklists
    ? Object.keys(checklistObject.checklists).length + 1
    : 1;

  const newSection: IChecklist = {
    id: newChecklistKey,
    name: `Task List #${order}`,
    createdAt: Timestamp.now().toMillis(),
    createdBy: AUTH.currentUser.uid,
    order,
    tasks: newTask
      ? {
          [newTask.id]: {
            ...newTask,
            order: 1,
            status: false,
            createdAt: Timestamp.now().toMillis(),
          },
        }
      : {},
  };

  const serverUpdates: Partial<IChecklistGroup> = {
    checklists: {
      [newChecklistKey]: newSection,
    },
  };

  const localUpdates = checklistObject;
  set(localUpdates, `checklists.${newChecklistKey}`, newSection);

  return {
    serverUpdates,
    localUpdates,
  };
}

/**
 * Reorder the checklists in this group.
 * @param checklistKey The key of the checklist to move.
 */
export function reorderChecklists(
  checklistObject: IChecklistGroup,
  checklistKey: string,
  toIndex: number
) {
  // Check if the task exists
  if (!checklistObject.checklists?.[checklistKey]) {
    throw new Error("There is no task with this ID");
  }
  const serverUpdates: Partial<IChecklistGroup> = {};
  const localUpdates = checklistObject;

  // Create a copy of the objects array
  const updatedOrder = getChecklistsArray(checklistObject);

  // Find the index of the object to delete
  const fromIndex = updatedOrder.findIndex(
    (checklist) => checklist.id === checklistKey
  );

  // Swap the objects at the specified indices
  const [removedObject] = updatedOrder.splice(fromIndex, 1);
  updatedOrder.splice(toIndex, 0, removedObject);

  // Update the order attribute of the moved objects and the other objects in the array
  updatedOrder.forEach((checklist, index) => {
    const newOrder = index + 1;
    set(serverUpdates, `checklists.${checklist.id}.order`, newOrder);
    set(localUpdates, `checklists.${checklist.id}.order`, newOrder);
  });

  return {
    serverUpdates,
    localUpdates,
  };
}

/**
 * Update a specific checklist.
 * @param checklist The new checklist data.
 */
export function updateChecklist(
  baseObject: IChecklistGroup,
  checklistId: string,
  checklist: Partial<{
    name: string;
    description: string;
  }>
) {
  const serverUpdate = {
    checklists: {
      [checklistId]: checklist,
    },
  };
  const localUpdate = baseObject;
  set(localUpdate, `checklists.${checklistId}`, checklist);

  return {
    localUpdate,
    serverUpdate,
  };
}
