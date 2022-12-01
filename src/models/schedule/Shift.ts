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

export class Shift implements IShift, PrimaryFirestore, FirebaseSignature {
  public readonly id: string;
  public readonly docRef: DocumentReference<DocumentData>;
  public readonly createdAt: Timestamp;
  public readonly createdBy: string;
  public readonly start: string;
  public readonly end: string;
  private readonly _position?: string;
  private readonly _notes?: string;
  private readonly _hourlyWage?: number;
  public readonly status: "draft" | "published";
  public readonly pendingUpdate?: Partial<IShift>;
  public readonly deleting?: boolean;
  public readonly updatedAt: Timestamp;
  private _wageData: {
    normalHours: number;
    overtimeHours: number;
    totalHours: number;
    normalWage: number;
    overtimeWage: number;
    totalWage: number;
  };

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
   * @returns {Dayjs} dayjs date
   */
  static toDate(date: string): Dayjs {
    return dayjs(date, SHIFTFORMAT);
  }

  /**
   * Converts a shift formatted Date to a string
   * @param {Date} date date to convert
   * @returns {string} formatted date string
   */
  static toString(date: Date): string {
    return dayjs(date).format(SHIFTFORMAT);
  }

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

  public get position(): string | undefined {
    if (this.hasPendingUpdates) {
      return this.pendingUpdate?.position ?? "";
    }
    return this._position;
  }

  public get notes(): string | undefined {
    if (this.hasPendingUpdates) {
      return this.pendingUpdate?.notes ?? "";
    }
    return this._notes;
  }

  public get hourlyWage(): number {
    if (this.hasPendingUpdates) {
      return this.pendingUpdate?.hourlyWage ?? 0;
    }
    return this._hourlyWage ?? 0;
  }

  /**
   * Get the start date as a dayjs date
   * @date 7/11/2022 - 0:27:19
   *
   * @public
   * @readonly
   */
  public get getStartDayjsDate(): Dayjs {
    if (this.hasPendingUpdates && this.pendingUpdate?.start) {
      return dayjs(this.pendingUpdate.start, SHIFTFORMAT);
    }

    return dayjs(this.start, SHIFTFORMAT);
  }

  /**
   * Get the end date as a dayjs date
   * @date 7/11/2022 - 0:27:42
   *
   * @public
   * @readonly
   */
  public get getEndDayjsDate(): Dayjs {
    if (this.hasPendingUpdates && this.pendingUpdate?.end) {
      return dayjs(this.pendingUpdate.end, SHIFTFORMAT);
    }
    return dayjs(this.end, SHIFTFORMAT);
  }

  /**
   * Get ISO week number of the shift start date
   * @date 7/11/2022 - 0:28:02
   *
   * @public
   * @readonly
   */
  public get shiftIsoWeekday(): number {
    return this.getStartDayjsDate.isoWeekday();
  }

  /**
   * Check if the shift has a pending update
   * @date 7/11/2022 - 0:28:28
   *
   * @public
   * @readonly
   */
  public get hasPendingUpdates(): boolean {
    return !isEmpty(this.pendingUpdate);
  }

  /**
   * Get the duration of the shift in hours and minutes
   * @date 7/11/2022 - 0:29:14
   *
   * @public
   * @readonly
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
   * @date 7/11/2022 - 0:44:42
   *
   * @public
   * @readonly
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
   * @date 7/11/2022 - 0:45:18
   *
   * @public
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
   *
   * @date 7/11/2022 - 0:49:33
   *
   * @public
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
