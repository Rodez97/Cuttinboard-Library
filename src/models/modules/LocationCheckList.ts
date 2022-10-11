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
  deleteDoc,
} from "firebase/firestore";
import { isEmpty } from "lodash";
import { FirebaseSignature } from "../FirebaseSignature";
import { PrimaryFirestore } from "../PrimaryFirestore";
import { Todo_Task } from "./Todo_Task";

/**
 * Interfaz de la app Tareas
 */

export interface ILocationCheckList {
  name: string;
  description?: string;
  /**
   * Id del usuario que firma la checklist
   */
  signedBy?: string;
  /**
   * Fecha a la que corresponde la checklist
   */
  checklistDate?: Timestamp;
  /**
   * Lista de tareas a realizar
   */
  tasks?: Record<string, Todo_Task>;
}

export class LocationCheckList
  implements ILocationCheckList, PrimaryFirestore, FirebaseSignature
{
  public readonly name: string;
  public readonly description?: string;
  public readonly signedBy?: string;
  public readonly checklistDate?: Timestamp;
  public readonly tasks?: Record<string, Todo_Task>;
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly createdAt: Timestamp;
  public readonly createdBy: string;

  public static Converter: FirestoreDataConverter<LocationCheckList> = {
    toFirestore(object: WithFieldValue<LocationCheckList>): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<ILocationCheckList & FirebaseSignature>,
      options: SnapshotOptions
    ): LocationCheckList {
      const { id, ref } = value;
      const rawData = value.data(options)!;
      return new LocationCheckList(rawData, { id, docRef: ref });
    },
  };

  constructor(
    {
      name,
      description,
      signedBy,
      checklistDate,
      tasks,
      createdAt,
      createdBy,
    }: ILocationCheckList & FirebaseSignature,
    { id, docRef }: PrimaryFirestore
  ) {
    this.name = name;
    this.description = description;
    this.signedBy = signedBy;
    this.checklistDate = checklistDate;
    this.tasks = tasks;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.id = id;
    this.docRef = docRef;
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

  public async clearTasks() {
    if (isEmpty(this.tasks)) {
      throw new Error("There is no tasks");
    }
    const tasks = Object.keys(this.tasks);
    const update: Record<string, { status: boolean }> = {};

    tasks.forEach((task) => {
      update[task] = { status: false };
    });
    try {
      await setDoc(
        this.docRef,
        {
          tasks: update,
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

  public async update(updates: Partial<ILocationCheckList>) {
    try {
      await setDoc(this.docRef, updates, { merge: true });
    } catch (error) {
      throw error;
    }
  }
}
