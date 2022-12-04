import dayjs, { Dayjs } from "dayjs";
import {
  DocumentReference,
  DocumentData,
  setDoc,
  Timestamp,
  deleteField,
} from "firebase/firestore";
import { PrimaryFirestore } from "../PrimaryFirestore";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import { isEmpty } from "lodash";
import { FirebaseSignature } from "../FirebaseSignature";
import { SHIFTFORMAT } from "../../utils";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(duration);
dayjs.extend(isBetween);

/**
 * Base interface implemented by Shift class.
 */
export interface IShift {
  start: string;
  end: string;
  position?: string;
  notes?: string;
  hourlyWage?: number;
  status: "draft" | "published";
  pendingUpdate?: Partial<IShift>;
  deleting?: boolean;
  updatedAt: Timestamp;
}

/**
 * A class that represents a shift in the database.
 */
export class Shift implements IShift, PrimaryFirestore, FirebaseSignature {
  /**
   * Id of the shift
   */
  public readonly id: string;
  /**
   * Document reference of the shift
   */
  public readonly docRef: DocumentReference<DocumentData>;
  /**
   * Timestamp of when the shift was created
   */
  public readonly createdAt: Timestamp;
  /**
   * Id of the user who created the shift
   */
  public readonly createdBy: string;
  /**
   * Start date of the shift in string format
   * - Format: `DD-MM-YYYY HH:mm` (e.g. 01-01-2021 12:00)
   */
  public readonly start: string;
  /**
   * End date of the shift in string format
   * - Format: `DD-MM-YYYY HH:mm` (e.g. 01-01-2021 12:00)
   */
  public readonly end: string;
  /**
   * Position associated with the shift
   */
  private readonly _position?: string;
  /**
   * Short notes about the shift
   */
  private readonly _notes?: string;
  /**
   * Wage per hour of the shift
   */
  private readonly _hourlyWage?: number;
  /**
   * The current status of the shift
   * - `draft` - The shift is not published
   * - `published` - The shift is published
   */
  public readonly status: "draft" | "published";
  /**
   * An object containing the pending updates to the shift as a partial shift object.
   */
  public readonly pendingUpdate?: Partial<IShift>;
  /**
   * True if the shift is marked for deletion.
   */
  public readonly deleting?: boolean;
  /**
   * Timestamp of when the shift was last updated
   */
  public readonly updatedAt: Timestamp;
  /**
   * Get the wage data of the shift
   */
  private _wageData: {
    /**
     * Number of hours worked without overtime
     */
    normalHours: number;
    /**
     * Number of overtime hours worked
     */
    overtimeHours: number;
    /**
     * Total worked hours
     * - `normalHours + overtimeHours`
     */
    totalHours: number;
    /**
     * Wage for normal hours
     */
    normalWage: number;
    /**
     * Wage for overtime hours
     */
    overtimeWage: number;
    /**
     * Total wage
     * - `normalWage + overtimeWage`
     */
    totalWage: number;
  };

  /**
   * Get the base data of the shift independent of pending updates.
   * - User to show the actual data in the UI. (My Shifts)
   */
  public get origData() {
    return {
      start: dayjs(this.start, SHIFTFORMAT),
      end: dayjs(this.end, SHIFTFORMAT),
      position: this._position,
      notes: this._notes,
    };
  }

  /**
   * Parses a string into a dayjs date
   * @param {string} date date string
   */
  static toDate(date: string): Dayjs {
    return dayjs(date, SHIFTFORMAT);
  }

  /**
   * Converts a shift formatted Date to a string
   * @param {Date} date date to convert
   */
  static toString(date: Date): string {
    return dayjs(date).format(SHIFTFORMAT);
  }

  /**
   * Creates an instance of Shift.
   * @param data Data to create a shift from
   * @param firestoreBase The id and docRef of the shift
   */
  constructor(
    {
      start,
      end,
      position,
      notes,
      hourlyWage,
      deleting,
      pendingUpdate,
      status,
      createdAt: createdAt,
      createdBy,
      updatedAt,
    }: IShift & FirebaseSignature,
    { id, docRef }: PrimaryFirestore
  ) {
    this.id = id;
    this.docRef = docRef;
    this.start = start;
    this.end = end;
    this._position = position;
    this._notes = notes;
    this._hourlyWage = hourlyWage;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.deleting = deleting;
    this.pendingUpdate = pendingUpdate;
    this.status = status;
    this.updatedAt = updatedAt;
  }

  /**
   * Get the position associated with the shift
   */
  public get position(): string | undefined {
    if (this.hasPendingUpdates) {
      return this.pendingUpdate?.position ?? "";
    }
    return this._position;
  }

  /**
   * Get the notes associated with the shift
   */
  public get notes(): string | undefined {
    if (this.hasPendingUpdates) {
      return this.pendingUpdate?.notes ?? "";
    }
    return this._notes;
  }

  /**
   * Wage per hour of the shift
   */
  public get hourlyWage(): number {
    if (this.hasPendingUpdates) {
      return this.pendingUpdate?.hourlyWage ?? 0;
    }
    return this._hourlyWage ?? 0;
  }

  /**
   * Get the start date as a dayjs date
   */
  public get getStartDayjsDate(): Dayjs {
    if (this.hasPendingUpdates && this.pendingUpdate?.start) {
      return dayjs(this.pendingUpdate.start, SHIFTFORMAT);
    }

    return dayjs(this.start, SHIFTFORMAT);
  }

  /**
   * Get the end date as a dayjs date
   */
  public get getEndDayjsDate(): Dayjs {
    if (this.hasPendingUpdates && this.pendingUpdate?.end) {
      return dayjs(this.pendingUpdate.end, SHIFTFORMAT);
    }
    return dayjs(this.end, SHIFTFORMAT);
  }

  /**
   * Get ISO week number of the shift start date
   */
  public get shiftIsoWeekday(): number {
    return this.getStartDayjsDate.isoWeekday();
  }

  /**
   * True if the shift has a pending update
   */
  public get hasPendingUpdates(): boolean {
    return !isEmpty(this.pendingUpdate);
  }

  /**
   * Duration of the shift in hours and minutes
   */
  public get shiftDuration(): { totalHours: number; totalMinutes: number } {
    if (this.deleting) {
      // if the shift is being deleted, the duration is 0
      return { totalHours: 0, totalMinutes: 0 };
    }

    let totalMinutes = 0;

    if (
      this.hasPendingUpdates &&
      this.pendingUpdate?.start &&
      this.pendingUpdate?.end
    ) {
      // If there are pending updates, use those dates
      totalMinutes = Shift.toDate(this.pendingUpdate.end).diff(
        Shift.toDate(this.pendingUpdate.start),
        "minute"
      );
    } else {
      totalMinutes = this.getEndDayjsDate.diff(
        this.getStartDayjsDate,
        "minutes"
      );
    }
    const totalHours = totalMinutes / 60;
    return { totalHours, totalMinutes };
  }

  /**
   * Get the base wage for the shift based on the hourly wage and the duration of the shift
   */
  public get getBaseWage(): number {
    if (this.deleting) {
      // if the shift is being deleted, the wage is 0
      return 0;
    }

    return this.hourlyWage * this.shiftDuration.totalHours;
  }

  /**
   * Get the wage data for the shift
   */
  public get wageData(): {
    normalHours: number;
    overtimeHours: number;
    totalHours: number;
    normalWage: number;
    overtimeWage: number;
    totalWage: number;
  } {
    if (this._wageData) {
      // If wage data has already been calculated, return it
      return this._wageData;
    } else {
      // Return default values
      return {
        normalHours: this.shiftDuration.totalHours,
        overtimeHours: 0,
        totalHours: this.shiftDuration.totalHours,
        normalWage: this.getBaseWage,
        overtimeWage: 0,
        totalWage: this.getBaseWage,
      };
    }
  }

  private set wageData(value: {
    normalHours: number;
    overtimeHours: number;
    totalHours: number;
    normalWage: number;
    overtimeWage: number;
    totalWage: number;
  }) {
    this._wageData = value;
  }

  /**
   * Edits the current shift
   * @param pendingUpdate - The pending update
   */
  public async editShift(pendingUpdate: Partial<IShift>) {
    // Add pending update to shift
    await setDoc(
      this.docRef,
      { shifts: { [this.id]: { pendingUpdate } } },
      { mergeFields: [`shifts.${this.id}.pendingUpdate`] }
    );
  }

  /**
   * Cancel pending update
   */
  public async cancelUpdate() {
    // Remove pending update from shift
    await setDoc(
      this.docRef,
      { shifts: { [this.id]: { pendingUpdate: deleteField() } } },
      { mergeFields: [`shifts.${this.id}.pendingUpdate`] }
    );
  }

  /**
   * Delete shift
   */
  public async delete() {
    if (this.status === "draft") {
      // If the shift is a draft, delete it
      await setDoc(
        this.docRef,
        { shifts: { [this.id]: deleteField() } },
        { merge: true }
      );
    } else {
      // If the shift is not a draft, mark it as deleting
      await setDoc(
        this.docRef,
        { shifts: { [this.id]: { deleting: true } } },
        { merge: true }
      );
    }
  }

  /**
   * Restore a pending deletion shift
   */
  public async restore() {
    // Remove deleting state from shift
    await setDoc(
      this.docRef,
      { shifts: { [this.id]: { deleting: false } } },
      { merge: true }
    );
  }

  /**
   * Calculate the shift wage data based on the overtime settings
   * @param {number} accumulatedHours - The accumulated hours from previous shifts in the week, set to 0 if you want to calculate the wage data for the current shift only or daily overtime
   * @param {number} hoursLimit - The overtime hours limit
   * @param {number} overtimeRateOfPay - The overtime rate of pay
   */
  public calculateHourlyWage(
    accumulatedHours: number,
    hoursLimit: number,
    overtimeRateOfPay: number
  ) {
    const totalShiftHours = this.shiftDuration.totalHours;
    // Calculate total accumulated hours
    const totalAccumulatedHours = accumulatedHours + totalShiftHours;

    if (totalAccumulatedHours <= hoursLimit) {
      // If total accumulated hours is less than or equal to the overtime hours limit, set default values and return
      this.wageData = {
        normalHours: totalShiftHours,
        overtimeHours: 0,
        totalHours: totalShiftHours,
        normalWage: this.getBaseWage,
        overtimeWage: 0,
        totalWage: this.getBaseWage,
      };
      return;
    }

    // Calculate the total overtime hours
    let totalOvertimeHours = totalAccumulatedHours - hoursLimit;

    if (totalOvertimeHours < 0) {
      // If total overtime hours is less than 0, set it to 0
      totalOvertimeHours = 0;
    }

    let shiftOvertimeHours = 0;

    if (totalOvertimeHours >= totalShiftHours) {
      // If total overtime hours is greater than or equal to the total shift hours, set the shift overtime hours to the total shift hours
      shiftOvertimeHours = totalShiftHours;
    } else {
      // If total overtime hours is less than the total shift hours, set the shift overtime hours to the total overtime hours
      shiftOvertimeHours = totalOvertimeHours;
    }

    const shiftNormalHours = totalShiftHours - shiftOvertimeHours;

    if (!this.hourlyWage) {
      // If hourly wage is not set, set default values to 0 and return
      this.wageData = {
        normalHours: shiftNormalHours,
        overtimeHours: shiftOvertimeHours,
        totalHours: totalShiftHours,
        normalWage: 0,
        overtimeWage: 0,
        totalWage: 0,
      };
      return;
    }

    // Set wage data
    this.wageData = {
      normalHours: shiftNormalHours,
      overtimeHours: shiftOvertimeHours,
      totalHours: totalShiftHours,
      normalWage: this.getBaseWage,
      overtimeWage: shiftOvertimeHours * overtimeRateOfPay,
      totalWage: this.getBaseWage + shiftOvertimeHours * overtimeRateOfPay,
    };
  }
}
