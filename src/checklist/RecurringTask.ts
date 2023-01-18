import {
  deleteField,
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  setDoc,
  SnapshotOptions,
} from "firebase/firestore";
import { PrimaryFirestore } from "../models/PrimaryFirestore";
import { Frequency, RRule } from "rrule";
import dayjs from "dayjs";
import { RecurrenceObject } from "./types";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
dayjs.extend(timezone);
dayjs.extend(utc);

/**
 * The RecurringTask interface implemented by the RecurringTask class.
 */
export interface IRecurringTask {
  name: string;
  description?: string;
  recurrence: string;
  completed?: string;
}

/**
 * RecurringTask is a class that represents a recurring task.
 */
export class RecurringTask implements IRecurringTask {
  /**
   * The name or content of the task
   */
  public readonly name: string;
  /**
   * A short description of the task
   */
  public readonly description?: string;
  /**
   * The recurrence rule of the task as a string (RRule.toString())
   * @see https://jakubroztocil.github.io/rrule/
   */
  public readonly recurrence: string;

  /**
   * The date the task was last completed as a string (Day.js.format()) or undefined if it has not been completed yet.
   * - The format is "YYYY-MM-DD"
   * @see https://jakubroztocil.github.io/rrule/
   * @see https://day.js.org/docs/en/display/format
   */
  public readonly completed?: string;

  /**
   * Creates a new RecurringTask class instance.
   * @param data RecurringTask data
   */
  constructor({ name, description, recurrence, completed }: IRecurringTask) {
    this.name = name;
    this.description = description;
    this.recurrence = recurrence;
    this.completed = completed;
  }

  /**
   * Returns the Recurrence Rule from the Recurrence Object
   * @param param Recurrence Object
   */
  public static getRRuleFromObject({
    interval,
    unit,
    startingOn,
    byweekday,
    onDay,
  }: RecurrenceObject): RRule {
    let recurrenceRule: RRule;

    let dtstart: Date;
    if (startingOn) {
      // Check if the startingOn date is in UTC or local time
      const isUTC = dayjs(startingOn).isUTC();
      if (isUTC) {
        dtstart = startingOn;
      } else {
        // Convert to UTC
        dtstart = dayjs(startingOn).utc().toDate();
      }
    } else {
      dtstart = dayjs().utc().toDate();
    }

    switch (unit) {
      case Frequency.DAILY:
        recurrenceRule = new RRule({
          freq: RRule.DAILY,
          dtstart,
          interval,
        });
        break;
      case Frequency.WEEKLY:
        recurrenceRule = new RRule({
          freq: RRule.WEEKLY,
          interval,
          byweekday,
          dtstart,
        });
        break;
      case Frequency.MONTHLY:
        recurrenceRule = new RRule({
          freq: RRule.MONTHLY,
          interval: interval,
          bymonthday: onDay ? [onDay] : undefined,
          dtstart,
        });
        break;
      default:
        throw new Error("Invalid unit");
    }

    return recurrenceRule;
  }

  /**
   * Returns a Recurrence Object from the Recurrence Rule
   * @param rule Recurrence Rule
   */
  public static getRRuleObjectFromRule(rule: RRule): RecurrenceObject {
    const { freq, interval, byweekday, bymonthday, dtstart } = rule.options;
    return {
      interval,
      unit: freq,
      startingOn: dtstart,
      byweekday: Array.isArray(byweekday) ? byweekday : [byweekday],
      onDay: Array.isArray(bymonthday) ? bymonthday[0] : bymonthday,
    };
  }

  /**
   * Returns the Recurrence Rule from this Recurring Task
   */
  public get recurrenceRule(): RRule {
    if (this.recurrence && typeof this.recurrence === "string") {
      // Recurrence is a string
      return RRule.fromString(this.recurrence);
    }
    // Return a default rule
    return new RRule({
      freq: RRule.DAILY,
      dtstart: dayjs().utc().toDate(),
      interval: 1,
    });
  }

  /**
   * Get the next occurrence of the task
   */
  public get nextOccurrence(): Date {
    const todayUTC = dayjs().utc().startOf("day").toDate(); // today in UTC
    const nextOccurrence = this.recurrenceRule.after(todayUTC, true);
    return nextOccurrence;
  }

  /**
   * Checks if the task is due today
   */
  public get isToday(): boolean {
    const todayUTC = dayjs().utc();
    const nextOccurUTC = dayjs(this.nextOccurrence).utc();
    return nextOccurUTC.isSame(todayUTC, "day");
  }

  /**
   * Task completion status
   */
  public get isCompleted(): boolean {
    return Boolean(
      this.completed && this.completed === dayjs().format("YYYY-MM-DD")
    );
  }
}

/**
 * The basic interface for a RecurringTaskDoc document.
 */
export interface IRecurringTaskDoc {
  signedBy?: {
    name: string;
    id: string;
  };
  locationId: string;
  tasks?: {
    [key: string]: IRecurringTask;
  };
}

/**
 * The RecurringTaskDoc class represents a RecurringTaskDoc document.
 * - A RecurringTaskDoc document contains a record of all recurring tasks for a location.
 */
export class RecurringTaskDoc implements IRecurringTaskDoc, PrimaryFirestore {
  /**
   * The id of the document
   */
  public readonly id: string;
  /**
   * The document reference from the firestore database.
   */
  public readonly docRef: DocumentReference<DocumentData>;
  /**
   * The last user who signed the document
   * @remarks
   * This is not used by now but it can be used in the future to track who signed the document.
   */
  public readonly signedBy?: {
    name: string;
    id: string;
  };
  /**
   * The id of the location this document belongs to
   */
  public readonly locationId: string;
  /**
   * The record of all recurring tasks for this location
   */
  public readonly tasks?: {
    [key: string]: RecurringTask;
  };

  /**
   * Converts a QueryDocumentSnapshot to a RecurringTaskDoc class instance.
   */
  public static firestoreConverter: FirestoreDataConverter<RecurringTaskDoc> = {
    toFirestore: (
      modelObject: PartialWithFieldValue<RecurringTaskDoc>
    ): DocumentData => {
      const { docRef, id, ...objectToSave } = modelObject;
      return objectToSave;
    },
    fromFirestore: (
      value: QueryDocumentSnapshot<IRecurringTaskDoc>,
      options: SnapshotOptions
    ) => {
      const { id, ref } = value;
      const rawData = value.data(options);
      return new RecurringTaskDoc(rawData, { id, docRef: ref });
    },
  };

  /**
   * Creates a new RecurringTaskDoc class instance.
   * @param data RecurringTaskDoc data
   * @param firestoreBase The id and document reference of the document
   * @remarks
   * Since we get the recurring tasks as an object, we need to convert them to a RecurringTask class instance.
   */
  constructor(
    { signedBy, locationId, tasks }: IRecurringTaskDoc,
    { id, docRef }: PrimaryFirestore
  ) {
    this.signedBy = signedBy;
    this.locationId = locationId;
    const newTasks: { [key: string]: RecurringTask } = {};
    Object.entries(tasks ?? {}).forEach(([key, value]) => {
      newTasks[key] = new RecurringTask(value);
    });
    this.tasks = newTasks;
    this.id = id;
    this.docRef = docRef;
  }

  /**
   * Return an array of all recurring tasks extracted from the tasks object
   */
  public get tasksArray(): [string, RecurringTask][] {
    return Object.entries(this.tasks ?? {});
  }

  /**
   * Return an array of all recurring tasks sorted by their next occurrence
   */
  public get tasksArraySorted(): [string, RecurringTask][] {
    return Object.entries(this.tasks ?? {}).sort((a, b) => {
      return a[1].nextOccurrence.getTime() - b[1].nextOccurrence.getTime();
    });
  }

  /**
   * Add a new recurring task to the tasks object
   * @param task Recurring Task to add
   * @param id Id of the task
   */
  public addPeriodicTask = async (task: IRecurringTask, id: string) =>
    await setDoc(this.docRef, { tasks: { [id]: task } }, { merge: true });

  /**
   * Remove a recurring task from the tasks object by its id.
   * @param id Id of the task to remove
   */
  public removePeriodicTask = async (id: string) =>
    await setDoc(
      this.docRef,
      { tasks: { [id]: deleteField() } },
      { merge: true }
    );

  /**
   * Update a recurring task in the tasks object by its id.
   * @param task Recurring Task to update
   * @param id Id of the task to update
   */
  public updatePeriodicTask = async (task: IRecurringTask, id: string) =>
    await setDoc(this.docRef, { tasks: { [id]: task } }, { merge: true });

  /**
   * Changes the task completion status
   */
  public async toggleCompleted(taskId: string): Promise<void> {
    const task = this.tasks?.[taskId];
    if (!task) {
      throw new Error("Task not found");
    }
    const completionStatus = task.isCompleted
      ? deleteField()
      : dayjs().format("YYYY-MM-DD");

    await setDoc(
      this.docRef,
      {
        tasks: {
          [taskId]: {
            completed: completionStatus,
          },
        },
      },
      { merge: true }
    );
  }
}
