import {
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from "firebase/firestore";
import { weekToDate } from "../../services";
import { FirebaseSignature } from "../FirebaseSignature";
import { PrimaryFirestore } from "../PrimaryFirestore";
import { Schedule_DayStats } from "./Schedule_DayStats";

export interface IScheduleDoc {
  locationId: string;
  notes?: string;
  weekId: string;
  statsByDay?: Record<number, Schedule_DayStats>;
  weekNumber: number;
  notificationRecipients?: string[];
  updatedAt: Timestamp;
  year: number;
}

export class ScheduleDoc
  implements IScheduleDoc, PrimaryFirestore, FirebaseSignature
{
  public readonly locationId: string;
  public readonly notes?: string;
  public readonly weekId: string;
  public readonly statsByDay?: Record<number, Schedule_DayStats>;
  public readonly weekNumber: number;
  public readonly notificationRecipients?: string[];
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly createdAt: Timestamp;
  public readonly createdBy: string;
  public readonly updatedAt: Timestamp;
  public readonly year: number;

  public static Converter = {
    toFirestore(object: ScheduleDoc): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<IScheduleDoc & FirebaseSignature>,
      options: SnapshotOptions
    ): ScheduleDoc {
      const { id, ref } = value;
      const rawData = value.data(options)!;
      return new ScheduleDoc(rawData, { id, docRef: ref });
    },
  };

  constructor(
    {
      locationId,
      notes,
      weekId,
      statsByDay,
      weekNumber,
      notificationRecipients,
      createdAt,
      createdBy,
      updatedAt,
      year,
    }: IScheduleDoc & FirebaseSignature,
    { id, docRef }: PrimaryFirestore
  ) {
    this.id = id;
    this.docRef = docRef;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.locationId = locationId;
    this.notes = notes;
    this.weekId = weekId;
    this.statsByDay = statsByDay;
    this.weekNumber = weekNumber;
    this.notificationRecipients = notificationRecipients;
    this.updatedAt = updatedAt;
    this.year = year;
  }

  public get getWeekStart(): Date {
    const firstDayWeek = weekToDate(this.year, this.weekNumber, 1);
    return firstDayWeek;
  }
}
