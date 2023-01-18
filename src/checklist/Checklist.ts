import {
  deleteField,
  DocumentReference,
  FieldValue,
  PartialWithFieldValue,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { ITask, Task } from "./Task";

/**
 * A checklist is a list of tasks that can be completed.
 */
export interface IChecklist {
  name: string;
  description?: string;
  tasks?: Record<string, ITask>;
  createdAt?: Timestamp;
  createdBy?: string;
  order: number;
}

export class Checklist implements IChecklist {
  public readonly id: string;
  public readonly documentRef: DocumentReference;
  /***********************************************/
  public readonly name: string;
  public readonly description?: string | undefined;
  public readonly tasks?: Record<string, ITask> | undefined;
  public readonly createdAt?: Timestamp | undefined;
  public readonly createdBy?: string | undefined;
  public readonly order: number;

  public static sortChecklistOrTask(
    data: (Checklist | Task)[],
    mode: "asc" | "desc"
  ) {
    if (!data) {
      return;
    }
    return data.sort((a, b) => {
      return mode === "asc" ? a.order - b.order : b.order - a.order;
    });
  }

  constructor(
    { name, description, tasks, createdAt, createdBy, order }: IChecklist,
    id: string,
    documentRef: DocumentReference
  ) {
    this.name = name;
    this.description = description;
    this.tasks = tasks;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.order = order;

    this.id = id;
    this.documentRef = documentRef;
  }

  public get tasksArray() {
    if (!this.tasks) {
      return [];
    }
    return Object.entries(this.tasks)
      .map(([key, task]) => {
        return new Task(task, this.id, key, this.documentRef);
      })
      .sort((a, b) => {
        return a.order - b.order;
      });
  }

  /**
   * Return the summary of the checklist
   */
  public get summary() {
    // Initialize the summary object with zero values
    const summary = {
      total: 0,
      completed: 0,
    };

    // If there are no tasks, return the empty summary object
    if (this.tasksArray.length === 0) {
      return summary;
    }

    // Loop through the tasks and increment the total and completed counters
    this.tasksArray.forEach((task) => {
      summary.total++;
      if (task.status) {
        summary.completed++;
      }
    });

    // Return the summary object
    return summary;
  }

  /**
   * Update a specific checklist.
   * @param checklist The new checklist data.
   */
  public async update(
    checklist: PartialWithFieldValue<{
      name: string;
      description: string;
    }>
  ) {
    await setDoc(
      this.documentRef,
      {
        checklists: {
          [this.id]: checklist,
        },
      },
      { merge: true }
    );
  }

  /**
   * Add a new task to a checklist.
   * @param taskKey The key of the task to add.
   * @param name The task to add.
   */
  public async addTask(taskKey: string, name: string) {
    // Check if the task exists
    if (this.tasks?.[taskKey]) {
      throw new Error("There is already a task with this ID");
    }

    const order = this.tasksArray.length + 1;

    const newTask = {
      order,
      name: name,
      status: false,
      createdAt: serverTimestamp(),
    };

    await setDoc(
      this.documentRef,
      {
        checklists: {
          [this.id]: {
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
   * @param taskKey The key of the task to delete.
   */
  public async removeTask(taskKey: string) {
    // Check if the task exists
    if (!this.tasks?.[taskKey]) {
      throw new Error("There is no task with this ID");
    }
    let updatedTasks: Record<string, { order: number } | FieldValue> = {
      [taskKey]: deleteField(),
    };

    // Create a copy of the objects array
    const updatedOrder = [...this.tasksArray];

    // Find the index of the object to delete
    const index = updatedOrder.findIndex((task) => task.id === taskKey);

    // Remove the object at the specified index
    updatedOrder.splice(index, 1);

    // Update the order attribute of the remaining objects in the array
    updatedOrder.forEach((task, index) => {
      updatedTasks = {
        ...updatedTasks,
        [task.id]: {
          order: index + 1,
        },
      };
    });

    await setDoc(
      this.documentRef,
      {
        checklists: {
          [this.id]: {
            tasks: updatedTasks,
          },
        },
      },
      { merge: true }
    );
  }

  /**
   * Update the order of a task in a checklist.
   * @param taskKey The key of the task to move.
   */
  public async reorderTasks(taskKey: string, toIndex: number) {
    // Check if the task exists
    if (!this.tasks?.[taskKey]) {
      throw new Error("There is no task with this ID");
    }
    let updatedTasks: Record<string, { order: number }> = {};

    // Create a copy of the objects array
    const updatedOrder = [...this.tasksArray];

    // Find the index of the object to delete
    const fromIndex = updatedOrder.findIndex((task) => task.id === taskKey);

    // Swap the objects at the specified indices
    const [removedObject] = updatedOrder.splice(fromIndex, 1);
    updatedOrder.splice(toIndex, 0, removedObject);

    // Update the order attribute of the moved objects and the other objects in the array
    updatedOrder.forEach((task, index) => {
      updatedTasks = {
        ...updatedTasks,
        [task.id]: {
          order: index + 1,
        },
      };
    });

    await setDoc(
      this.documentRef,
      {
        checklists: {
          [this.id]: {
            tasks: updatedTasks,
          },
        },
      },
      { merge: true }
    );
  }
}
