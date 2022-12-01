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
import { WageDataByDay } from "./EmployeeShifts";

export type WeekSummary = {
  total: {
    normalHours: number;
    overtimeHours: number;
    totalHours: number;
    normalWage: number;
    overtimeWage: number;
    totalWage: number;
    totalPeople: number;
    totalShifts: number;
    projectedSales: number;
    laborPercentage: number;
  };
  byDay: WageDataByDay;
};

export interface IScheduleDoc {
  weekId: string;
  locationId: string;
  year: number;
  weekNumber: number;
  notificationRecipients?: string[];
  projectedSalesByDay?: Record<number, number>;
  updatedAt: Timestamp;
  scheduleSummary: WeekSummary;
}

export class ScheduleDoc
  implements IScheduleDoc, PrimaryFirestore, FirebaseSignature
{
  public readonly weekId: string;
  public readonly locationId: string;
  public readonly year: number;
  public readonly weekNumber: number;
  public readonly notificationRecipients?: string[];
  public readonly projectedSalesByDay?: Record<number, number>;
  public readonly updatedAt: Timestamp;
  public readonly scheduleSummary: WeekSummary;
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly createdAt: Timestamp;
  public readonly createdBy: string;

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
      const rawData = value.data(options);
      return new ScheduleDoc(rawData, { id, docRef: ref });
    },
  };

  constructor(
    {
      weekId,
      locationId,
      year,
      weekNumber,
      notificationRecipients,
      projectedSalesByDay,
      updatedAt,
      scheduleSummary,
      createdAt,
      createdBy,
    }: IScheduleDoc & FirebaseSignature,
    { id, docRef }: PrimaryFirestore
  ) {
    this.weekId = weekId;
    this.locationId = locationId;
    this.year = year;
    this.weekNumber = weekNumber;
    this.notificationRecipients = notificationRecipients;
    this.projectedSalesByDay = projectedSalesByDay;
    this.updatedAt = updatedAt;
    this.scheduleSummary = scheduleSummary;
    this.id = id;
    this.docRef = docRef;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
  }

  public get getWeekStart(): Date {
    const firstDayWeek = weekToDate(this.year, this.weekNumber, 1);
    return firstDayWeek;
  }

  public get totalProjectedSales(): number {
    return Object.values(this.projectedSalesByDay ?? {}).reduce(
      (acc, curr) => acc + curr,
      0
    );
  }

  public getSummaryByDay(day: number): WageDataByDay[number] {
    // Check if the day is in the week
    if (day < 1 || day > 7) {
      throw new Error("Day must be between 1 and 7");
    }
    // Check if the day exists in the summary
    if (!this.scheduleSummary?.byDay?.[day]) {
      // If not, return default values
      return {
        normalHours: 0,
        overtimeHours: 0,
        totalHours: 0,
        normalWage: 0,
        overtimeWage: 0,
        totalWage: 0,
        people: 0,
        totalShifts: 0,
      };
    }
    // If it does, return the day's summary
    return this.scheduleSummary.byDay[day];
  }
}
