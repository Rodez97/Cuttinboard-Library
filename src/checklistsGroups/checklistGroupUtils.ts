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
import { AUTH } from "../utils/firebase";
import { isEmpty, set } from "lodash-es";

/* `checklistGroupConverter` is an object that contains two methods: `toFirestore` and `fromFirestore`.
These methods are used to convert `IChecklistGroup` objects to and from Firestore documents. The
`toFirestore` method takes an `IChecklistGroup` object and returns a `DocumentData` object that can
be saved to Firestore. The `fromFirestore` method takes a `QueryDocumentSnapshot` object and returns
an `IChecklistGroup` object that can be used in the application. This object is used as a converter
when reading and writing data to Firestore. */
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
 * This function resets all tasks in a checklist object to false.
 * @param {IChecklistGroup} checklistObject - The checklistObject parameter is an object that
 * represents a group of checklists. It contains an array of checklists, each of which contains an
 * array of tasks. Each task has a status property that indicates whether it has been completed or not.
 * The resetAllTasks function takes this object as input and returns
 * @returns An object with two properties: `serverUpdates` and `localUpdates`.
 */
export function resetAllTasks(checklistObject: IChecklistGroup) {
  // Create a new object with all the tasks set to false
  const serverUpdates: Partial<IChecklistGroup> = {};

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
    }
  }

  return serverUpdates;
}

/**
 * This function removes a checklist from a checklist group object and updates the order of the
 * remaining checklists.
 * @param {IChecklistGroup} checklistObject - An object of type IChecklistGroup, which contains a list
 * of checklists.
 * @param {string} checklistKey - The ID of the checklist section to be removed from the
 * checklistObject.
 * @returns An object with two properties: `serverUpdates` and `localUpdates`.
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
  });

  return serverUpdates;
}

/**
 * This function adds a new checklist section with optional tasks to a checklist object.
 * @param {IChecklistGroup} checklistObject - An object of type IChecklistGroup which represents a
 * group of checklists.
 * @param {string} newChecklistKey - A string representing the unique identifier for the new checklist
 * section being added.
 * @param [newTask] - The optional parameter `newTask` is an object that represents a new task to be
 * added to the checklist. It has three properties: `id` (string), `name` (string), and `status`
 * (boolean). If `newTask` is not provided, an empty object will be
 * @returns An object with two properties: `serverUpdates` and `localUpdates`.
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

  return serverUpdates;
}

/**
 * This function reorders checklists in a checklist group by updating their order attribute and
 * returning the server and local updates.
 * @param {IChecklistGroup} checklistObject - An object that represents a group of checklists. It has a
 * property called "checklists" which is an object containing individual checklists as key-value pairs.
 * @param {string} checklistKey - The ID of the checklist to be reordered.
 * @param {number} toIndex - The index where the checklist being moved should be placed in the updated
 * order of checklists.
 * @returns An object with two properties: `serverUpdates` and `localUpdates`.
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
  });

  return serverUpdates;
}

/**
 * The function updates a checklist object with new name and description properties and returns both a
 * local and server update.
 * @param {IChecklistGroup} baseObject - The base object is an instance of the IChecklistGroup
 * interface, which likely contains a collection of checklists.
 * @param {string} checklistId - The ID of the checklist that needs to be updated.
 * @param checklist - The `checklist` parameter is an object that contains partial updates to a
 * checklist. It can include updates to the `name` and `description` properties of the checklist.
 * @returns An object with two properties: `localUpdate` and `serverUpdate`.
 */
export function updateChecklist(
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

  return serverUpdate;
}
