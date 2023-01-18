import { DocumentReference, setDoc, Timestamp } from "firebase/firestore";

/**
 * Tasks are the basic unit of work in the checklist.
 */
export interface ITask {
  name: string;
  status: boolean;
  createdAt: Timestamp;
  order: number;
}

export class Task implements ITask {
  readonly id: string;
  readonly documentRef: DocumentReference;
  /***********************************************/
  public readonly checklistParentId: string;
  /***********************************************/
  public readonly name: string;
  public readonly status: boolean;
  public readonly createdAt: Timestamp;
  public readonly order: number;

  public static sortTasks(tasks: Record<string, Task>) {
    if (!tasks) {
      return;
    }
    const sortedTasks: Record<string, Task> = {};
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

  constructor(
    { name, status, createdAt, order }: ITask,
    checklistParentId: string,
    id: string,
    documentRef: DocumentReference
  ) {
    this.name = name;
    this.status = status;
    this.createdAt = createdAt;
    this.order = order;

    this.checklistParentId = checklistParentId;

    this.id = id;
    this.documentRef = documentRef;
  }

  public async updateTask(name: string) {
    await setDoc(
      this.documentRef,
      {
        checklists: {
          [this.checklistParentId]: {
            tasks: {
              [this.id]: {
                name,
              },
            },
          },
        },
      },
      { merge: true }
    );
  }

  /**
   * Update the status of a task.
   * @param newStatus The new status of the task.
   */
  public async changeTaskStatus(newStatus: boolean) {
    await setDoc(
      this.documentRef,
      {
        checklists: {
          [this.checklistParentId]: {
            tasks: {
              [this.id]: {
                status: newStatus,
              },
            },
          },
        },
      },
      { merge: true }
    );
  }
}
