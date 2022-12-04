import {
  DocumentData,
  DocumentReference,
  Timestamp,
  FirestoreDataConverter,
  WithFieldValue,
  QueryDocumentSnapshot,
  SnapshotOptions,
  setDoc,
  deleteField,
  PartialWithFieldValue,
  serverTimestamp,
} from "firebase/firestore";
import { isEmpty } from "lodash";
import { Auth } from "../../firebase";
import { PrimaryFirestore } from "../PrimaryFirestore";

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

/**
 * A Checklist group is a group of checklists linked to a location.
 */
export interface IChecklistGroup {
  locationId: string;
  checklists?: {
    [key: string]: Checklist;
  };
}

/**
 * ChecklistGroup is a class that represents checklists grouped in a Firestore Document.
 */
export class ChecklistGroup implements IChecklistGroup, PrimaryFirestore {
  /**
   * The ID of the location this checklist group is linked to.
   */
  public readonly locationId: string;
  /**
   * A record of all the checklists in this group.
   */
  public readonly checklists?: {
    [key: string]: Checklist;
  };
  /**
   * The ID of the document in Firestore.
   */
  public readonly id: string;
  /**
   * The Firestore document reference of this checklist group.
   */
  public readonly docRef: DocumentReference<DocumentData>;

  /**
   * Convert a Firestore document snapshot to a ChecklistGroup object.
   */
  public static Converter: FirestoreDataConverter<ChecklistGroup> = {
    toFirestore(object: WithFieldValue<ChecklistGroup>): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<IChecklistGroup>,
      options: SnapshotOptions
    ): ChecklistGroup {
      const { id, ref } = value;
      const rawData = value.data(options);
      return new ChecklistGroup(rawData, { id, docRef: ref });
    },
  };

  /**
   * Create a new ChecklistGroup class instance.
   * @param data The data to create the checklist group with.
   * @param firestoreBase The Firestore document reference and ID of the checklist group.
   */
  constructor(
    { locationId, checklists }: IChecklistGroup,
    { id, docRef }: PrimaryFirestore
  ) {
    this.locationId = locationId;
    this.checklists = checklists;
    this.id = id;
    this.docRef = docRef;
  }

  /**
   * Get a summary of the completion status of all the tasks in the checklists of this group.
   */
  public get summary() {
    const summary = {
      total: 0,
      completed: 0,
    };

    if (!this.checklists || isEmpty(this.checklists)) {
      // If there are no sections, return the summary
      return summary;
    }

    for (const sectionKey in this.checklists) {
      const section = this.checklists[sectionKey];
      if (!section.tasks || isEmpty(section.tasks)) {
        // If there are no tasks in the section, skip it
        continue;
      }
      for (const taskKey in section.tasks) {
        const task = section.tasks[taskKey];
        summary.total++;
        if (task.status) {
          summary.completed++;
        }
      }
    }
    return summary;
  }

  /**
   * Get a summary of the completion status of a specific checklist in this group.
   * @param sectionKey The key of the checklist to get the summary of.
   */
  public getChecklistSummary(sectionKey: string) {
    const summary = {
      total: 0,
      completed: 0,
    };

    if (!this.checklists || isEmpty(this.checklists)) {
      // If there are no sections, return the summary
      return summary;
    }

    const section = this.checklists[sectionKey];
    if (isEmpty(section.tasks)) {
      // If there are no tasks in the section, skip it
      return summary;
    }
    for (const taskKey in section.tasks) {
      const task = section.tasks[taskKey];
      summary.total++;
      if (task.status) {
        summary.completed++;
      }
    }
    return summary;
  }

  /**
   * Update the status of a task.
   * @param checklistKey The key of the checklist that contains the task.
   * @param taskKey The key of the task to update.
   * @param status The new status of the task.
   */
  public async changeTaskStatus(
    checklistKey: string,
    taskKey: string,
    status: boolean
  ) {
    // Check if the task exists
    if (!this.checklists?.[checklistKey]?.tasks?.[taskKey]) {
      throw new Error("There is no task with this ID");
    }

    await setDoc(
      this.docRef,
      {
        checklists: {
          [checklistKey]: {
            tasks: {
              [taskKey]: {
                status,
              },
            },
          },
        },
      },
      { merge: true }
    );
  }

  /**
   * Add a new task to a checklist.
   * @param checklistKey The key of the checklist to add the task to.
   * @param taskKey The key of the task to add.
   * @param task The task to add.
   */
  public async addTask(checklistKey: string, taskKey: string, task: string) {
    // Check if the task exists
    if (this.checklists?.[checklistKey]?.tasks?.[taskKey]) {
      throw new Error("There is already a task with this ID");
    }

    // Get the order of the last task
    const allTasks = this.checklists?.[checklistKey]?.tasks;
    const lastTaskOrder = allTasks
      ? Object.values(allTasks)
          .map((task) => task.order)
          .sort((a, b) => b - a)[0]
      : 0;
    const newTaskOrder = lastTaskOrder + 1;

    const newTask = {
      order: newTaskOrder,
      name: task,
      status: false,
      createdAt: serverTimestamp(),
    };

    await setDoc(
      this.docRef,
      {
        checklists: {
          [checklistKey]: {
            tasks: {
              [taskKey]: newTask,
            },
          },
        },
      },
      { merge: true }
    );
  }

  /**
   * Delete a task from a checklist.
   * @param sectionKey The key of the checklist to delete the task from.
   * @param taskKey The key of the task to delete.
   */
  public async removeTask(sectionKey: string, taskKey: string) {
    // Check if the task exists
    if (!this.checklists?.[sectionKey]?.tasks?.[taskKey]) {
      throw new Error("There is no task with this ID");
    }

    await setDoc(
      this.docRef,
      {
        checklists: {
          [sectionKey]: {
            tasks: {
              [taskKey]: deleteField(),
            },
          },
        },
      },
      { merge: true }
    );
  }

  /**
   * Reset the status of all the tasks in all the checklists of this group.
   */
  public async resetAllTasks() {
    // Create a new object with all the tasks set to false
    const update: {
      [key: string]: {
        tasks: {
          [key: string]: {
            status: boolean;
          };
        };
      };
    } = {};

    if (!this.checklists || isEmpty(this.checklists)) {
      // If there are no sections, return
      return;
    }

    for (const sectionKey in this.checklists) {
      const section = this.checklists[sectionKey];
      if (!section.tasks || isEmpty(section.tasks)) {
        // If there are no tasks in the section, skip it
        continue;
      }
      update[sectionKey] = {
        tasks: {},
      };
      for (const taskKey in section.tasks) {
        update[sectionKey].tasks[taskKey] = {
          status: false,
        };
      }
    }

    await setDoc(this.docRef, { checklists: update }, { merge: true });
  }

  /**
   * Remove a checklist from this group.
   * @param checklistKey The key of the checklist to remove.
   */
  public async removeChecklist(checklistKey: string) {
    // Check if the section exists
    if (!this.checklists?.[checklistKey]) {
      throw new Error("There is no section with this ID");
    }

    await setDoc(
      this.docRef,
      {
        checklists: {
          [checklistKey]: deleteField(),
        },
      },
      { merge: true }
    );
  }

  /**
   * Add a new checklist to this group.
   * @param sectionKey The key of the checklist to add.
   * @param newTask If provided, a new task will be added to the checklist in the same operation.
   */
  public async addChecklist(
    sectionKey: string,
    newTask?: { id: string; name: string }
  ) {
    // Check if the section exists
    if (this.checklists?.[sectionKey]) {
      throw new Error("There is already a checklist with this ID");
    }

    if (!Auth.currentUser) {
      throw new Error("You must be logged in to add a section");
    }

    // Get the order of the last section
    const allSections = this.checklists;
    const lastSectionOrder =
      (allSections
        ? Object.values(allSections)
            .map((section) => section.order)
            .sort((a, b) => b - a)[0]
        : 0) ?? 1;
    const newSectionOrder = lastSectionOrder + 1;

    const newSection = {
      name: `Task Block #${newSectionOrder}`,
      createdAt: serverTimestamp(),
      createdBy: Auth.currentUser.uid,
      order: newSectionOrder,
      tasks: newTask
        ? {
            [newTask.id]: {
              name: newTask.name,
              order: 1,
              status: false,
              createdAt: serverTimestamp(),
            },
          }
        : {},
    };

    await setDoc(
      this.docRef,
      {
        checklists: {
          [sectionKey]: newSection,
        },
      },
      { merge: true }
    );
  }

  /**
   * Update a specific task in a checklist.
   * @param checklistKey The key of the checklist to update.
   * @param taskKey The key of the task to update.
   * @param task The new task data.
   */
  public async updateTask(
    checklistKey: string,
    taskKey: string,
    task: PartialWithFieldValue<Task>
  ) {
    // Check if the task exists
    if (!this.checklists?.[checklistKey]?.tasks?.[taskKey]) {
      throw new Error("There is no task with this ID");
    }

    await setDoc(
      this.docRef,
      {
        checklists: {
          [checklistKey]: {
            tasks: {
              [taskKey]: task,
            },
          },
        },
      },
      { merge: true }
    );
  }

  /**
   * Update a specific checklist.
   * @param checklistKey The key of the checklist to update.
   * @param checklist The new checklist data.
   */
  public async updateChecklist(
    checklistKey: string,
    checklist: PartialWithFieldValue<Omit<Checklist, "tasks">>
  ) {
    // Check if the section exists
    if (!this.checklists?.[checklistKey]) {
      throw new Error("There is no section with this ID");
    }

    await setDoc(
      this.docRef,
      {
        checklists: {
          [checklistKey]: checklist,
        },
      },
      { merge: true }
    );
  }

  /**
   * Delete of checklist and all its tasks from this group.
   */
  public async deleteAllTasks() {
    await setDoc(
      this.docRef,
      {
        checklists: {},
      },
      { merge: true }
    );
  }
}
