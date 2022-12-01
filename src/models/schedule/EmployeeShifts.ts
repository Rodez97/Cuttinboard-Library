import { PrimaryFirestore } from "../PrimaryFirestore";
import { FirebaseSignature } from "../FirebaseSignature";
import { IShift, Shift } from "./Shift";
import {
  DocumentReference,
  DocumentData,
  WriteBatch,
  deleteField,
  FieldValue,
  serverTimestamp,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
  setDoc,
  query,
  collection,
  where,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { isEmpty, orderBy } from "lodash";
import { Auth, Firestore } from "../../firebase";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import duration from "dayjs/plugin/duration";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isoWeek);
dayjs.extend(duration);
dayjs.extend(isBetween);

/**
 * @interface IEmployeeShifts - The interface for the EmployeeShifts class
 */
export interface IEmployeeShifts {
  /**
   * @property {Record<string, Shift>} shifts - The shifts for the employee
   */
  shifts?: Record<string, Shift>;
  /**
   * @property {string} employeeId - The employeeId for the employee
   */
  employeeId: string;
  /**
   * @property {string} weekId - The weekId for the employee shifts week
   */
  weekId: string;
  /**
   * @property {Timestamp} updatedAt - The updatedAt timestamp for the employee shifts
   */
  updatedAt: Timestamp;
  /**
   * @property {string} locationId - The locationId for the employee shifts
   */
  locationId: string;
}

export type WageDataByDay = {
  [weekday: number]: {
    normalHours: number;
    overtimeHours: number;
    totalHours: number;
    normalWage: number;
    overtimeWage: number;
    totalWage: number;
    totalShifts: number;
    people: number;
  };
};

/**
 * EmployeeShifts is a collection of shifts for a given employee and week.
 * @date 6/11/2022 - 23:38:09
 *
 * @export
 * @class EmployeeShifts
 * @typedef {EmployeeShifts}
 * @implements {IEmployeeShifts}
 * @implements {PrimaryFirestore}
 * @implements {FirebaseSignature}
 */
export class EmployeeShifts
  implements IEmployeeShifts, PrimaryFirestore, FirebaseSignature
{
  public readonly shifts?: Record<string, Shift> = {};
  public readonly employeeId: string;
  public readonly weekId: string;
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly createdAt: Timestamp;
  public readonly createdBy: string;
  public readonly updatedAt: Timestamp;
  public readonly locationId: string;
  private _wageData: WageDataByDay;

  /**
   * Firestore Data Converter
   */
  public static Converter = {
    toFirestore(object: EmployeeShifts): DocumentData {
      const { docRef, id, ...objectToSave } = object;
      return objectToSave;
    },
    fromFirestore(
      value: QueryDocumentSnapshot<IEmployeeShifts & FirebaseSignature>,
      options: SnapshotOptions
    ): EmployeeShifts {
      const { id, ref } = value;
      const rawData = value.data(options);
      return new EmployeeShifts(rawData, { id, docRef: ref });
    },
  };

  public static Reference = (weekId: string) =>
    globalThis.locationData
      ? query(
          collection(
            Firestore,
            "Organizations",
            globalThis.locationData.organizationId,
            "shifts"
          ),
          where("weekId", "==", weekId),
          where("locationId", "==", globalThis.locationData.id)
        ).withConverter(EmployeeShifts.Converter)
      : null;

  constructor(
    {
      shifts,
      employeeId,
      weekId,
      createdAt,
      createdBy,
      updatedAt,
      locationId,
    }: IEmployeeShifts & FirebaseSignature,
    { id, docRef }: PrimaryFirestore
  ) {
    this.id = id;
    this.docRef = docRef;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.updatedAt = updatedAt;
    this.employeeId = employeeId;
    this.locationId = locationId;
    this.weekId = weekId;

    if (shifts && !isEmpty(shifts)) {
      // Convert the shifts object to Shift class and add it to the shifts object
      this.shifts = Object.entries(shifts).reduce<Record<string, Shift>>(
        (acc, [shiftId, shiftData]) => {
          acc[shiftId] = new Shift(shiftData, { id: shiftId, docRef });
          return acc;
        },
        {}
      );
    }
  }

  /**
   * Get the shifts array from the shifts object and sort it by start time in ascending order (earliest to latest)
   */
  public get shiftsArray(): Shift[] {
    if (!this.shifts || isEmpty(this.shifts)) {
      return [];
    }
    // Order shifts by start date
    return orderBy(
      Object.values(this.shifts),
      (e) => e.getStartDayjsDate,
      "asc"
    );
  }

  public get wageData(): WageDataByDay {
    if (this._wageData) {
      // If the wage data is already calculated, return it
      return this._wageData;
    }
    if (isEmpty(this.shifts)) {
      // If there are no shifts, return an empty object
      return {};
    }
    // If the wage data is not calculated, calculate it and return it
    const wageData = this.shiftsArray.reduce<WageDataByDay>((acc, shift) => {
      const weekday = shift.getStartDayjsDate.isoWeekday();
      const shiftHours = shift.shiftDuration.totalHours;
      const shiftWage = shift.getBaseWage;
      const shiftOvertimeWage = 0;
      const shiftOvertimeHours = 0;
      if (acc[weekday]) {
        // If the weekday already exists in the accumulator, add the shift hours and wage to the existing values
        acc[weekday].normalHours += shiftHours;
        acc[weekday].overtimeHours += shiftOvertimeHours;
        acc[weekday].totalHours += shiftHours + shiftOvertimeHours;
        acc[weekday].normalWage += shiftWage;
        acc[weekday].overtimeWage += shiftOvertimeWage;
        acc[weekday].totalWage += shiftWage + shiftOvertimeWage;
        acc[weekday].totalShifts += 1;
      } else {
        // If the weekday does not exist in the accumulator, add it with the shift hours and wage
        acc[weekday] = {
          normalHours: shiftHours,
          overtimeHours: shiftOvertimeHours,
          totalHours: shiftHours + shiftOvertimeHours,
          normalWage: shiftWage,
          overtimeWage: shiftOvertimeWage,
          totalWage: shiftWage + shiftOvertimeWage,
          totalShifts: 1,
          people: 1,
        };
      }
      return acc;
    }, {});
    this._wageData = wageData;

    return this._wageData;
  }

  private set wageData(value: WageDataByDay) {
    this._wageData = value;
  }

  public get summary(): WageDataByDay[0] {
    const wageData = this.wageData;
    const summary = Object.values(wageData).reduce<WageDataByDay[0]>(
      (acc, day) => {
        acc.normalHours += day.normalHours;
        acc.overtimeHours += day.overtimeHours;
        acc.totalHours += day.totalHours;
        acc.normalWage += day.normalWage;
        acc.overtimeWage += day.overtimeWage;
        acc.totalWage += day.totalWage;
        acc.totalShifts += day.totalShifts;
        return acc;
      },
      {
        normalHours: 0,
        overtimeHours: 0,
        totalHours: 0,
        normalWage: 0,
        overtimeWage: 0,
        totalWage: 0,
        totalShifts: 0,
        people: 1,
      }
    );
    return summary;
  }

  /**
   * Check is the employee's schedule have any changes or is unpublished
   */
  public get haveChanges(): boolean {
    return this.shiftsArray.some((shift) =>
      Boolean(
        shift.hasPendingUpdates || shift.deleting || shift.status === "draft"
      )
    );
  }

  /**
   * Initialize/Calculate the wage data for the employee's schedule for the week
   * based on the *overtime* settings for the location and the employee's wage
   *
   * - If there is no overtime settings for the location, the wage data will be
   * calculated based on the employee's wage only
   *
   * - If this functions in not called, the wage data will be the default value without overtime
   *
   */
  public calculateWageData(
    args: {
      mode: "weekly" | "daily";
      hoursLimit: number;
      multiplier: number;
    } | null = null
  ) {
    // initialize the wage data
    const sum: WageDataByDay = {};

    if (isEmpty(this.shifts)) {
      // if there is no shifts, return the default value
      this.wageData = sum;
      return;
    }

    if (args === null) {
      // if no args, just return the total
      this.shiftsArray.forEach((shift) => {
        const weekday = shift.getStartDayjsDate.isoWeekday();
        const shiftHours = shift.shiftDuration.totalHours;
        const shiftWage = shift.getBaseWage;
        const shiftOvertimeWage = 0;
        const shiftOvertimeHours = 0;
        if (sum[weekday]) {
          // If the weekday already exists in the accumulator, add the shift hours and wage to the existing values
          sum[weekday].normalHours += shiftHours;
          sum[weekday].overtimeHours += shiftOvertimeHours;
          sum[weekday].totalHours += shiftHours + shiftOvertimeHours;
          sum[weekday].normalWage += shiftWage;
          sum[weekday].overtimeWage += shiftOvertimeWage;
          sum[weekday].totalWage += shiftWage + shiftOvertimeWage;
          sum[weekday].totalShifts += 1;
        } else {
          // If the weekday does not exist in the accumulator, add it with the shift hours and wage
          sum[weekday] = {
            normalHours: shiftHours,
            overtimeHours: shiftOvertimeHours,
            totalHours: shiftHours + shiftOvertimeHours,
            normalWage: shiftWage,
            overtimeWage: shiftOvertimeWage,
            totalWage: shiftWage + shiftOvertimeWage,
            totalShifts: 1,
            people: 1,
          };
        }
      });
      this.wageData = sum;
      return;
    }

    const { mode, hoursLimit, multiplier } = args;
    // if there is args, calculate the overtime
    const overtimeRateOfPay = this.getOvertimeRateOfPay(multiplier);
    if (mode === "weekly") {
      // if the mode is weekly, calculate the overtime based on the total hours
      let accumulatedHours = 0;
      this.shiftsArray.forEach((shift) => {
        shift.calculateHourlyWage(
          accumulatedHours,
          hoursLimit,
          overtimeRateOfPay
        );
        const {
          normalHours,
          overtimeHours,
          totalHours,
          normalWage,
          overtimeWage,
          totalWage,
        } = shift.wageData;
        accumulatedHours += shift.shiftDuration.totalHours;
        const weekday = shift.getStartDayjsDate.isoWeekday();
        if (sum[weekday]) {
          // If the weekday already exists in the accumulator, add the shift hours and wage to the existing values
          sum[weekday].normalHours += normalHours;
          sum[weekday].overtimeHours += overtimeHours;
          sum[weekday].totalHours += totalHours;
          sum[weekday].normalWage += normalWage;
          sum[weekday].overtimeWage += overtimeWage;
          sum[weekday].totalWage += totalWage;
          sum[weekday].totalShifts += 1;
        } else {
          // If the weekday does not exist in the accumulator, add it with the shift hours and wage
          sum[weekday] = {
            normalHours,
            overtimeHours,
            totalHours,
            normalWage,
            overtimeWage,
            totalWage,
            totalShifts: 1,
            people: 1,
          };
        }
      });
    }

    if (mode === "daily") {
      // if the mode is daily, calculate the overtime based on the daily hours
      this.shiftsArray.forEach((shift) => {
        shift.calculateHourlyWage(0, hoursLimit, overtimeRateOfPay);
        const {
          normalHours,
          overtimeHours,
          totalHours,
          normalWage,
          overtimeWage,
          totalWage,
        } = shift.wageData;
        const weekday = shift.getStartDayjsDate.isoWeekday();
        if (sum[weekday]) {
          // If the weekday already exists in the accumulator, add the shift hours and wage to the existing values
          sum[weekday].normalHours += normalHours;
          sum[weekday].overtimeHours += overtimeHours;
          sum[weekday].totalHours += totalHours;
          sum[weekday].normalWage += normalWage;
          sum[weekday].overtimeWage += overtimeWage;
          sum[weekday].totalWage += totalWage;
          sum[weekday].totalShifts += 1;
        } else {
          // If the weekday does not exist in the accumulator, add it with the shift hours and wage
          sum[weekday] = {
            normalHours,
            overtimeHours,
            totalHours,
            normalWage,
            overtimeWage,
            totalWage,
            totalShifts: 1,
            people: 1,
          };
        }
      });
    }

    // set the wage data
    this.wageData = sum;
  }

  /**
   * Creates a new shift and adds it to the schedule
   * @date 6/11/2022 - 23:11:52
   *
   * @public
   * @async
   * @param {IShift} shift - The shift to add
   * @param {Date[]} dates - The dates to add the shift to
   * @param {number[]} applyToWeekDays - The weekdays to apply the shift to
   * @param {string} id - The id of the shift
   * @returns {Promise<void>} - A promise that resolves when the shift is added
   */
  public async createShift(
    shift: IShift,
    dates: Date[],
    applyToWeekDays: number[],
    id: string
  ): Promise<void> {
    if (!Auth.currentUser) {
      throw new Error("User not authenticated");
    }

    // New shift record
    let newShifts: Record<
      string,
      WithFieldValue<IShift & FirebaseSignature>
    > = {};

    const { start, end, ...rest } = shift;
    const baseStart = Shift.toDate(start);
    const baseEnd = Shift.toDate(end);
    // Create a new shift for each date
    for (const isoWeekDay of applyToWeekDays) {
      const shiftId = `${isoWeekDay}-${id}`;
      const column = dates.find((c) => dayjs(c).isoWeekday() === isoWeekDay);
      // Adjust the start and end dates to the correct weekday
      const newStart = dayjs(column)
        .hour(baseStart.hour())
        .minute(baseStart.minute());
      const newEnd = dayjs(column)
        .hour(baseEnd.hour())
        .minute(baseEnd.minute());
      // If end time is before start time, add a day to the end time
      const end = newEnd.isBefore(newStart) ? newEnd.add(1, "day") : newEnd;
      // Create the new shift
      newShifts = {
        ...newShifts,
        [shiftId]: {
          ...rest,
          start: Shift.toString(newStart.toDate()),
          end: Shift.toString(end.toDate()),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: Auth.currentUser.uid,
          status: "draft",
        },
      };
    }
    // Add the new shifts to the schedule
    await setDoc(this.docRef, { shifts: newShifts }, { merge: true });
  }

  /**
   * Publishes all shifts in the schedule
   * @date 6/11/2022 - 23:09:43
   *
   * @public
   * @param {WriteBatch} batch - Firestore batch
   */
  public batchPublish(batch: WriteBatch) {
    // If there are no shifts, return
    if (!this.shifts || isEmpty(this.shifts)) {
      return;
    }

    // Create a record of shifts to update
    const shiftsUpdates: Record<
      string,
      PartialWithFieldValue<Shift> | FieldValue
    > = {};

    // Loop through each shift
    Object.entries(this.shifts).forEach(([id, shift]) => {
      if (shift.deleting) {
        // If the shift is marked for deletion, delete it
        shiftsUpdates[id] = deleteField();
      } else if (
        shift.status !== "published" ||
        !isEmpty(shift.pendingUpdate)
      ) {
        // If the shift is not published, or has pending updates, publish it
        shiftsUpdates[id] = {
          updatedAt: serverTimestamp(),
          status: "published",
          ...shift.pendingUpdate,
          pendingUpdate: deleteField(),
        };
      }
    });

    // If there are no shifts to update, return
    if (isEmpty(shiftsUpdates)) {
      return;
    }

    // Update the shifts
    batch.set(
      this.docRef,
      {
        updatedAt: serverTimestamp(),
        shifts: shiftsUpdates,
      },
      { merge: true }
    );
  }

  /**
   * Unpublish all shifts in the schedule
   * @date 6/11/2022 - 23:07:32
   *
   * @public
   * @param {WriteBatch} batch - Firestore batch
   */
  public batchUnpublish(batch: WriteBatch) {
    // If there are no shifts, return
    if (!this.shifts || isEmpty(this.shifts)) {
      return;
    }

    // Create a record of shifts to update
    let shiftsUpdates: Record<string, { status: "draft" }> = {};

    // Loop through each shift
    Object.keys(this.shifts).forEach((id) => {
      // Add the shift to the record of shifts to update
      shiftsUpdates = { ...shiftsUpdates, [id]: { status: "draft" } };
    });

    // Add the shifts to the batch
    batch.set(
      this.docRef,
      {
        updatedAt: serverTimestamp(),
        shifts: shiftsUpdates,
      },
      { merge: true }
    );
  }

  /**
   * Check if a new shift start or end time overlaps with an existing shift
   * @date 6/11/2022 - 23:05:18
   *
   * @param {dayjs.Dayjs} start - The start time of the new shift
   * @param {dayjs.Dayjs} end - The end time of the new shift
   * @param {string} shiftId - The id of the shift to ignore
   * @returns {boolean} true if there is an overlap
   */
  public checkForOverlappingShifts = (
    start: dayjs.Dayjs,
    end: dayjs.Dayjs,
    shiftId: string
  ): boolean => {
    // Check if there are any shifts
    if (!this.shiftsArray.length) {
      return false;
    }

    // Check if the new shift start or end time overlaps with an existing shift
    return this.shiftsArray.some((shift) => {
      // Check if the shift is the same shift
      if (shift.id === shiftId) {
        return false;
      }

      // Check if the new shift start or end time overlaps with an existing shift
      return (
        start.isBetween(
          shift.getStartDayjsDate,
          shift.getEndDayjsDate,
          null,
          "[]"
        ) ||
        end.isBetween(
          shift.getStartDayjsDate,
          shift.getEndDayjsDate,
          null,
          "[]"
        )
      );
    });
  };

  /**
   * Calculate the overtime rate of pay
   * @date 6/11/2022 - 23:00:15
   *
   * @param {number} multiplier Multiplier for the wage
   * @returns {number} The overtime rate of pay
   */
  public getOvertimeRateOfPay = (multiplier: number) => {
    // Check if there are any shifts
    if (!this.shiftsArray.length) {
      return 0;
    }
    // Get total hours from shifts array
    const totalHours = this.shiftsArray.reduce(
      (acc, shift) => acc + shift.shiftDuration.totalHours,
      0
    );
    // Get total wage from shifts array
    const totalWage = this.shiftsArray.reduce(
      (acc, shift) => acc + shift.getBaseWage,
      0
    );
    // Calculate the regular rate of pay
    const regularRateOfPay = totalWage / totalHours;
    return regularRateOfPay * (multiplier - 1);
  };
}
