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
import { PrimaryFirestore } from "../PrimaryFirestore";
import { ByWeekday, Frequency, RRule } from "rrule";
import dayjs from "dayjs";

export type RecurrenceObject = {
  every: number;
  unit: Frequency;
  startingOn?: Date;
  weekDays?: ByWeekday[];
  onDay?: number;
  dailyType: "every" | "weekDays";
};

export interface IRecurringTask {
  name: string;
  description?: string;
  recurrence: string;
}

/**
 * RecurringTask is a class that represents a recurring task.
 */
export class RecurringTask implements IRecurringTask {
  public readonly name: string;
  public readonly description?: string;
  public readonly recurrence: string;

  constructor({ name, description, recurrence }: IRecurringTask) {
    this.name = name;
    this.description = description;
    this.recurrence = recurrence;
  }

  /**
   * Returns the Recurrence Rule from the Recurrence Object
   * @param param Recurrence Object
   * @returns Recurrence Rule
   */
  public static getRRuleFromObject({
    every,
    unit,
    startingOn,
    weekDays,
    onDay,
    dailyType,
  }: RecurrenceObject): RRule {
    let recurrenceRule: RRule;
    if (unit === Frequency.DAILY) {
      if (dailyType === "every") {
        // Every X days
        recurrenceRule = new RRule({
          freq: RRule.DAILY,
          dtstart: startingOn,
          interval: every,
        });
      } else {
        recurrenceRule = RRule.fromText("Every weekday");
      }
    } else if (unit === Frequency.WEEKLY) {
      // Every X weeks on Y days
      recurrenceRule = new RRule({
        freq: RRule.WEEKLY,
        dtstart: startingOn,
        interval: every,
        byweekday: weekDays,
      });
    } else if (unit === Frequency.MONTHLY) {
      // Every X months on Y day
      recurrenceRule = new RRule({
        freq: RRule.MONTHLY,
        dtstart: startingOn,
        interval: every,
        bymonthday: onDay ? [onDay] : undefined,
      });
    } else {
      throw new Error("Invalid unit");
    }
    return recurrenceRule;
  }

  /**
   * Returns a Recurrence Object from the Recurrence Rule
   * @param rule Recurrence Rule
   * @returns Recurrence Object
   */
  public static getRRuleObjectFromRule(rule: RRule): RecurrenceObject {
    const { freq, interval, byweekday, bymonthday, dtstart } = rule.options;
    const unit = freq;
    const every = interval;
    const startingOn = dtstart;
    const weekDays = Array.isArray(byweekday) ? byweekday : [byweekday];
    const onDay = Array.isArray(bymonthday) ? bymonthday[0] : bymonthday;
    const dailyType = weekDays?.length ? "weekDays" : "every";
    return {
      every,
      unit,
      startingOn,
      weekDays,
      onDay,
      dailyType,
    };
  }

  /**
   * Returns the Recurrence Rule from this Recurring Task
   * @type {RRule}
   */
  public get recurrenceRule(): RRule {
    if (this.recurrence && typeof this.recurrence === "string") {
      // Recurrence is a string
      return RRule.fromString(this.recurrence);
    }
    // Return a default rule
    return new RRule({
      freq: RRule.DAILY,
      dtstart: new Date(),
      interval: 1,
    });
  }

  /**
   * Checks if a date matches the recurrence rule
   * @param date Date to check
   * @returns True if the date matches the recurrence rule
   */
  public matchesDate(date: Date): boolean {
    const rule = this.recurrenceRule;
    return rule.between(date, date).length > 0;
  }

  /**
   * Checks if the task is due today
   * @type {boolean}
   */
  public get isToday(): boolean {
    const today = dayjs().startOf("day");
    const nextOccurrence = this.recurrenceRule.after(today.toDate(), true);
    return nextOccurrence && dayjs(nextOccurrence).isSame(today, "day");
  }

  /**
   * Get the next occurrence of the task
   * @type {Date}
   */
  public get nextOccurrence(): Date {
    return this.recurrenceRule.after(new Date());
  }
}

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

export class RecurringTaskDoc implements IRecurringTaskDoc, PrimaryFirestore {
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly signedBy?: {
    name: string;
    id: string;
  };
  public readonly locationId: string;
  public readonly tasks?: {
    [key: string]: RecurringTask;
  };

  public static Converter: FirestoreDataConverter<RecurringTaskDoc> = {
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

  public get tasksArray(): [string, RecurringTask][] {
    return Object.entries(this.tasks ?? {});
  }

  public get tasksArraySorted(): [string, RecurringTask][] {
    return Object.entries(this.tasks ?? {}).sort((a, b) => {
      return a[1].nextOccurrence.getTime() - b[1].nextOccurrence.getTime();
    });
  }

  public addPeriodicTask = async (task: IRecurringTask, id: string) =>
    await setDoc(this.docRef, { tasks: { [id]: task } }, { merge: true });

  public removePeriodicTask = async (id: string) =>
    await setDoc(
      this.docRef,
      { tasks: { [id]: deleteField() } },
      { merge: true }
    );

  public updatePeriodicTask = async (task: IRecurringTask, id: string) =>
    await setDoc(this.docRef, { tasks: { [id]: task } }, { merge: true });
}
