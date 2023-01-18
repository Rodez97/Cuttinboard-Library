import {
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  WithFieldValue,
  QueryDocumentSnapshot,
  SnapshotOptions,
  setDoc,
  deleteField,
  serverTimestamp,
  FieldValue,
} from "firebase/firestore";
import { isEmpty } from "lodash";
import { AUTH } from "../utils/firebase";
import { PrimaryFirestore } from "../models/PrimaryFirestore";
import { Checklist, IChecklist } from "./Checklist";

/**
 * A Checklist group is a group of checklists linked to a location.
 */
export interface IChecklistGroup {
  locationId: string;
  checklists?: {
    [key: string]: IChecklist;
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
  private _checklists?:
    | {
        [key: string]: IChecklist;
      }
    | undefined;
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
  public static firestoreConverter: FirestoreDataConverter<ChecklistGroup> = {
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
    this._checklists = checklists;
    this.id = id;
    this.docRef = docRef;
  }

  public get checklists():
    | {
        [key: string]: IChecklist;
      }
    | undefined {
    return this._checklists;
  }

  private set checklists(
    value:
      | {
          [key: string]: IChecklist;
        }
      | undefined
  ) {
    this._checklists = value;
  }

  public get checklistsArray() {
    if (!this.checklists) {
      return [];
    }
    return Object.entries(this.checklists)
      .map(([key, task]) => {
        return new Checklist(task, key, this.docRef);
      })
      .sort((a, b) => {
        return a.order - b.order;
      });
  }

  /**
   * Get a summary of the completion status of all the tasks in the checklists of this group.
   */
  public get summary() {
    // Initialize the summary object with zero values
    const summary = {
      total: 0,
      completed: 0,
    };

    // If there are no tasks, return the empty summary object
    if (this.checklistsArray.length === 0) {
      return summary;
    }

    // Loop through the tasks and increment the total and completed counters
    this.checklistsArray.forEach((checklist) => {
      summary.total += checklist.summary.total;
      summary.completed += checklist.summary.completed;
    });

    return summary;
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
    let updatedChecklists: Record<string, { order: number } | FieldValue> = {
      [checklistKey]: deleteField(),
    };

    // Create a copy of the objects array
    const updatedOrder = [...this.checklistsArray];

    // Find the index of the object to delete
    const index = updatedOrder.findIndex(
      (checklist) => checklist.id === checklistKey
    );

    // Remove the object at the specified index
    updatedOrder.splice(index, 1);

    // Update the order attribute of the remaining objects in the array
    updatedOrder.forEach((checklist, index) => {
      updatedChecklists = {
        ...updatedChecklists,
        [checklist.id]: {
          order: index + 1,
        },
      };
    });

    await setDoc(
      this.docRef,
      {
        checklists: updatedChecklists,
      },
      { merge: true }
    );
  }

  /**
   * Add a new checklist to this group.
   * @param newChecklistKey The key of the checklist to add.
   * @param newTask If provided, a new task will be added to the checklist in the same operation.
   */
  public async addChecklist(
    newChecklistKey: string,
    newTask?: { id: string; name: string }
  ) {
    // Check if the section exists
    if (this.checklists?.[newChecklistKey]) {
      throw new Error("There is already a checklist with this ID");
    }

    if (!AUTH.currentUser) {
      throw new Error("You must be logged in to add a section");
    }

    const order = this.checklistsArray.length + 1;

    const newSection = {
      name: `Task List #${order}`,
      createdAt: serverTimestamp(),
      createdBy: AUTH.currentUser.uid,
      order,
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
          [newChecklistKey]: newSection,
        },
      },
      { merge: true }
    );
  }

  /**
   * Reorder the checklists in this group.
   * @param checklistKey The key of the checklist to move.
   */
  public async reorderChecklists(checklistKey: string, toIndex: number) {
    // Check if the task exists
    if (!this.checklists?.[checklistKey]) {
      throw new Error("There is no task with this ID");
    }
    let updatedChecklists: Record<string, { order: number }> = {};

    // Create a copy of the objects array
    const updatedOrder = [...this.checklistsArray];

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
      updatedChecklists = {
        ...updatedChecklists,
        [checklist.id]: {
          order: newOrder,
        },
      };
      if (this.checklists?.[checklist.id]) {
        this.checklists = {
          ...this.checklists,
          [checklist.id]: {
            ...this.checklists[checklist.id],
            order: newOrder,
          },
        };
      }
    });

    await setDoc(
      this.docRef,
      {
        checklists: updatedChecklists,
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
