import {
  doc,
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
  setDoc,
  SnapshotOptions,
  Timestamp,
} from "firebase/firestore";
import { AUTH, FIRESTORE } from "../utils/firebase";
import { weekToDate } from "./weekToDate";
import { FirebaseSignature, PrimaryFirestore } from "../models";
import { WageDataByDay } from "./EmployeeShifts";
import { WeekSummary } from "./WeekSummary";

/**
 * The interface implemented by the ScheduleDoc class.
 */
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

/**
 * A ScheduleDoc is a document that contains the basic information about a week's schedule.
 */
export class ScheduleDoc
  implements IScheduleDoc, PrimaryFirestore, FirebaseSignature
{
  /**
   * The id of the week.
   * @see WEEKFORMAT
   */
  public readonly weekId: string;
  /**
   * The id of the location that this schedule is for.
   */
  public readonly locationId: string;
  /**
   * The year of the schedule.
   */
  public readonly year: number;
  /**
   * The ISO week number of the schedule.
   */
  public readonly weekNumber: number;
  /**
   * When we publish the schedule, we send the ids of the people who should receive notifications so that we can send them a notification from the cloud function.
   * This is an array of user ids.
   */
  public readonly notificationRecipients?: string[];
  /**
   * The projected sales for each day of the week.
   */
  public readonly projectedSalesByDay?: Record<number, number>;
  /**
   * The time that this document was last updated.
   * This is a firebase timestamp.
   * @see https://firebase.google.com/docs/reference/js/firebase.firestore.Timestamp
   * - We use this to track when we need to send notifications to people.
   */
  public readonly updatedAt: Timestamp;
  /**
   * The summary of the week.
   */
  public readonly scheduleSummary: WeekSummary;
  /**
   * The id of the document.
   * - The format is `${weekId}_${locationId}`
   * @see WEEKFORMAT
   * @example "W-23-2022_zxcv1234567654321"
   */
  public readonly id: string;
  /**
   * The document reference for this document.
   */
  public readonly docRef: DocumentReference<DocumentData>;
  /**
   * The time that this document was created.
   */
  public readonly createdAt: Timestamp;
  /**
   * The id of the user who created this document.
   */
  public readonly createdBy: string;

  /**
   * Firestore data converter for ScheduleDoc.
   */
  public static firestoreConverter = {
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

  /**
   * Creates a Default ScheduleDoc for a given week.
   */
  public static createDefaultScheduleDoc(weekId: string): ScheduleDoc {
    if (!globalThis.locationData) {
      throw new Error("locationData is not defined.");
    }
    if (!AUTH.currentUser) {
      throw new Error("You must be logged in to create a schedule.");
    }
    const locationId = globalThis.locationData.id;
    const weekData = weekId.split("-");
    const year = Number(weekData[2]);
    const weekNumber = Number(weekData[1]);
    return new this(
      {
        weekId,
        locationId,
        year,
        weekNumber,
        updatedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        createdBy: AUTH.currentUser.uid,
        scheduleSummary: {
          total: {
            normalHours: 0,
            overtimeHours: 0,
            totalHours: 0,
            normalWage: 0,
            overtimeWage: 0,
            totalWage: 0,
            totalPeople: 0,
            totalShifts: 0,
            projectedSales: 0,
            laborPercentage: 0,
          },
          byDay: {},
        },
      },
      {
        id: `${weekId}_${globalThis.locationData.id}`,
        docRef: doc(
          FIRESTORE,
          "Organizations",
          globalThis.locationData.organizationId,
          "scheduleDocs",
          `${weekId}_${globalThis.locationData.id}`
        ),
      }
    );
  }

  /**
   * Creates a new ScheduleDoc instance from the raw data.
   * @param data The data to create the ScheduleDoc from.
   * @param firestoreBase The id and document reference of the document.
   */
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

  /**
   * Get the first day of the week.
   */
  public get getWeekStart(): Date {
    const firstDayWeek = weekToDate(this.year, this.weekNumber, 1);
    return firstDayWeek;
  }

  /**
   * Get the sum of the projected sales for the week.
   */
  public get totalProjectedSales(): number {
    return Object.values(this.projectedSalesByDay ?? {}).reduce(
      (acc, curr) => acc + curr,
      0
    );
  }

  /**
   * Get the wage and hours summary of the week's schedule.
   * @param day The day of the week to get the summary for.
   */
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

  /**
   * Update the projected sales for the week.
   * @param projectedSalesByDay The projected sales for each day of the week.
   */
  public async updateProjectedSales(
    projectedSalesByDay: Record<number, number>
  ): Promise<void> {
    await setDoc(
      this.docRef,
      {
        projectedSalesByDay,
      },
      {
        merge: true,
      }
    );
  }
}
