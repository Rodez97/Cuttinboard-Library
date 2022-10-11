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
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

/**
 * Turno de trabajo
 */
export interface IShift<CREATION extends Timestamp | FieldValue = Timestamp> {
  createdAt: CREATION;
  updatedAt: CREATION;
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
  employeeId: string;
  hourlyWage?: number;
  altId: "repeat" | string;
  repeatDay?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  status: "draft" | "published";
  pendingUpdate?: Partial<IShift>;
  deleting?: boolean;
}

export class Shift implements IShift<Timestamp>, PrimaryFirestore {
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly createdAt: Timestamp;
  public readonly updatedAt: Timestamp;
  public readonly employeeId: string;
  public start: string;
  public end: string;
  public position?: string;
  public tasks?: Record<string, Todo_Task>;
  public notes?: string;
  public hourlyWage?: number;
  public altId: string;
  public repeatDay?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  public status: "draft" | "published";
  public pendingUpdate?: Partial<IShift<Timestamp>>;
  public readonly deleting?: boolean;

  constructor(
    {
      start,
      end,
      position,
      tasks,
      notes,
      employeeId,
      hourlyWage,
      altId,
      repeatDay,
      createdAt,
      updatedAt,
      deleting,
      pendingUpdate,
      status,
    }: IShift,
    { id, docRef }: PrimaryFirestore
  ) {
    this.id = id;
    this.docRef = docRef;
    this.start = start;
    this.end = end;
    this.position = position;
    this.tasks = tasks;
    this.notes = notes;
    this.employeeId = employeeId;
    this.hourlyWage = hourlyWage;
    this.altId = altId;
    this.repeatDay = repeatDay;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deleting = deleting;
    this.pendingUpdate = pendingUpdate;
    this.status = status;
  }

  public static Converter = {
    toFirestore(object: Shift): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<IShift>,
      options: SnapshotOptions
    ): Shift {
      const { id, ref } = value;
      const rawData = value.data(options)!;
      return new Shift(rawData, { id, docRef: ref });
    },
  };

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
      await updateDoc(this.docRef, { pendingUpdate });
    } catch (error) {
      throw error;
    }
  }

  public async cancelUpdate() {
    try {
      await updateDoc(this.docRef, { pendingUpdate: deleteField() });
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
        { tasks: { [taskId]: { status: completed } } },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }

  public async delete() {
    await updateDoc(this.docRef, { deleting: true });
  }

  public async restore() {
    await updateDoc(this.docRef, { deleting: false });
  }

  /**
   * Publish
   */
  public batchPublish(batch: WriteBatch) {
    if (this.deleting) {
      batch.delete(this.docRef);
    } else {
      batch.set(
        this.docRef,
        {
          updatedAt: serverTimestamp(),
          status: "published",
          ...this.pendingUpdate,
          pendingUpdate: deleteField(),
        },
        { merge: true }
      );
    }
  }

  public async publish() {
    await setDoc(
      this.docRef,
      {
        updatedAt: serverTimestamp(),
        status: "published",
        ...this.pendingUpdate,
        pendingUpdate: deleteField(),
      },
      { merge: true }
    );
  }

  public batchUnpublish(batch: WriteBatch) {
    batch.update(this.docRef, { status: "draft" });
  }

  public async unpublish() {
    await updateDoc(this.docRef, {
      status: "draft",
    });
  }
}
