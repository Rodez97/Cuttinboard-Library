import dayjs, { Dayjs } from "dayjs";
import {
  DocumentReference,
  DocumentData,
  setDoc,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
  FieldValue,
  serverTimestamp,
  updateDoc,
  WriteBatch,
  deleteField,
} from "firebase/firestore";
import { Todo_Task } from "../modules/Todo_Task";
import { PrimaryFirestore } from "../PrimaryFirestore";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import { SHIFTFORMAT } from "../../services";
import { isEmpty } from "lodash";
import { FirebaseSignature } from "../FirebaseSignature";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

/**
 * Turno de trabajo
 */
export interface IShift {
  /**
   * Inicio del turno
   */
  start: string;
  /**
   * Fin del turno
   */
  end: string;
  /**
   * Posición que desempeñarás durante el turno
   */
  position?: string;
  /**
   * Tareas asignadas para ese turno
   */
  tasks?: Record<string, Todo_Task>;
  /**
   * Notas del turno
   */
  notes?: string;
  hourlyWage?: number;
  status: "draft" | "published";
  pendingUpdate?: Partial<IShift>;
  deleting?: boolean;
  updatedAt: Timestamp;
}

export class Shift implements IShift, PrimaryFirestore, FirebaseSignature {
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly createdAt: Timestamp;
  public readonly createdBy: string;
  public readonly start: string;
  public readonly end: string;
  public readonly position?: string;
  public readonly tasks?: Record<string, Todo_Task>;
  public readonly notes?: string;
  public readonly hourlyWage?: number;
  public readonly status: "draft" | "published";
  public readonly pendingUpdate?: Partial<IShift>;
  public readonly deleting?: boolean;
  public readonly updatedAt: Timestamp;

  constructor(
    {
      start,
      end,
      position,
      tasks,
      notes,
      hourlyWage,
      deleting,
      pendingUpdate,
      status,
      createdAt,
      createdBy,
      updatedAt,
    }: IShift & FirebaseSignature,
    { id, docRef }: PrimaryFirestore
  ) {
    this.id = id;
    this.docRef = docRef;
    this.start = start;
    this.end = end;
    this.position = position;
    this.tasks = tasks;
    this.notes = notes;
    this.hourlyWage = hourlyWage;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.deleting = deleting;
    this.pendingUpdate = pendingUpdate;
    this.status = status;
    this.updatedAt = updatedAt;
  }

  public get getStartDayjsDate(): Dayjs {
    return dayjs(this.start, SHIFTFORMAT);
  }

  public get getEndDayjsDate(): Dayjs {
    return dayjs(this.end, SHIFTFORMAT);
  }

  public get shiftIsoWeekday(): number {
    return this.getStartDayjsDate.isoWeekday();
  }

  public get hasPendingUpdates(): boolean {
    return !isEmpty(this.pendingUpdate);
  }

  public get shiftDuration(): { totalHours: number; totalMinutes: number } {
    const totalMinutes = this.getEndDayjsDate.diff(
      this.getStartDayjsDate,
      "minutes"
    );
    const totalHours = totalMinutes / 60;
    return { totalHours, totalMinutes };
  }

  public get getWage(): number {
    if (!this.hourlyWage) {
      return 0;
    }
    return this.hourlyWage * this.shiftDuration.totalHours;
  }

  /**
   * Edits the current shift
   */
  public async editShift(pendingUpdate: Partial<IShift>) {
    try {
      await setDoc(
        this.docRef,
        { shifts: { [this.id]: { pendingUpdate } } },
        { mergeFields: [`shifts.${this.id}.pendingUpdate`] }
      );
    } catch (error) {
      throw error;
    }
  }

  public async cancelUpdate() {
    try {
      await setDoc(
        this.docRef,
        { shifts: { [this.id]: { pendingUpdate: deleteField() } } },
        { mergeFields: [`shifts.${this.id}.pendingUpdate`] }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change task status
   */
  public async changeTask(taskId: string, completed: boolean) {
    if (!this.tasks?.[taskId]) {
      return;
    }
    try {
      await setDoc(
        this.docRef,
        {
          shifts: { [this.id]: { tasks: { [taskId]: { status: completed } } } },
        },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }

  public async delete() {
    try {
      await setDoc(
        this.docRef,
        { shifts: { [this.id]: { deleting: true } } },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }

  public async restore() {
    try {
      await setDoc(
        this.docRef,
        { shifts: { [this.id]: { deleting: false } } },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }
}
