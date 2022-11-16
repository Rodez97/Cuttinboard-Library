import {
  QueryDocumentSnapshot,
  SnapshotOptions,
  DocumentData,
  DocumentReference,
  Timestamp,
  setDoc,
  WithFieldValue,
  deleteField,
  deleteDoc,
  PartialWithFieldValue,
} from "firebase/firestore";
import { isEmpty } from "lodash";
import { FirebaseSignature } from "../FirebaseSignature";
import { PrimaryFirestore } from "../PrimaryFirestore";
import { Todo_Task } from "./Todo_Task";

export interface ITodo {
  name: string;
  description?: string;
  assignedTo?: { id: string; name: string; email: string };
  dueDate?: Timestamp;
  tasks?: Record<string, Todo_Task>;
}

export class Todo implements ITodo, FirebaseSignature, PrimaryFirestore {
  name: string;
  description?: string;
  assignedTo?: { id: string; name: string; email: string };
  dueDate?: Timestamp;
  tasks?: Record<string, Todo_Task>;
  createdAt: Timestamp;
  createdBy: string;
  id: string;
  docRef: DocumentReference<DocumentData>;

  public static Converter = {
    toFirestore(object: Todo): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<ITodo & FirebaseSignature>,
      options: SnapshotOptions
    ): Todo {
      const { id, ref } = value;
      const rawData = value.data(options)!;
      return new Todo(rawData, { id, docRef: ref });
    },
  };

  constructor(
    {
      name,
      description,
      assignedTo,
      dueDate,
      tasks,
      createdAt,
      createdBy,
    }: ITodo & FirebaseSignature,
    { id, docRef }: PrimaryFirestore
  ) {
    this.name = name;
    this.description = description;
    this.assignedTo = assignedTo;
    this.dueDate = dueDate;
    this.tasks = tasks;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.id = id;
    this.docRef = docRef;
  }

  public get convertedDueDate() {
    if (!this.dueDate) {
      return null;
    }
    return this.dueDate.toDate();
  }

  public get tasksSummary() {
    let done = 0;
    let total = 0;
    if (!isEmpty(this.tasks)) {
      done = Object.values(this.tasks).filter((task) => task.status).length;
      total = Object.values(this.tasks).length;
    }
    return {
      done,
      total,
    };
  }

  public async changeTaskStatus(key: string, status: boolean) {
    if (!this.tasks?.[key]) {
      return;
    }
    try {
      await setDoc(
        this.docRef,
        { tasks: { [key]: { status } } },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }

  public async addTask(key: string, task: WithFieldValue<Todo_Task>) {
    if (this.tasks?.[key]) {
      throw new Error("Task already exists");
    }
    try {
      await setDoc(
        this.docRef,
        {
          tasks: { [key]: task },
        },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }

  public async removeTask(key: string) {
    if (!this.tasks?.[key]) {
      throw new Error("There is no task with this ID");
    }
    try {
      await setDoc(
        this.docRef,
        {
          tasks: { [key]: deleteField() },
        },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }

  public async delete() {
    try {
      await deleteDoc(this.docRef);
    } catch (error) {
      throw error;
    }
  }

  public async update(updates: PartialWithFieldValue<ITodo>) {
    try {
      await setDoc(this.docRef, updates, { merge: true });
    } catch (error) {
      throw error;
    }
  }
}
