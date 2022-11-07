import dayjs, { Dayjs } from "dayjs";
import {
  DocumentReference,
  DocumentData,
  setDoc,
  Timestamp,
  deleteField,
} from "firebase/firestore";
import { Todo_Task } from "../modules/Todo_Task";
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
  tasks?: Record<string, Todo_Task>;
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
  private _wageData: {
    normalHours: number;
    overtimeHours: number;
    totalHours: number;
    normalWage: number;
    overtimeWage: number;
    totalWage: number;
  };

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

  /**
   * Get the start date as a dayjs date
   * @date 7/11/2022 - 0:27:19
   *
   * @public
   * @readonly
   * @type {Dayjs} start date
   */
  public get getStartDayjsDate(): Dayjs {
    return dayjs(this.start, SHIFTFORMAT);
  }

  /**
   * Get the end date as a dayjs date
   * @date 7/11/2022 - 0:27:42
   *
   * @public
   * @readonly
   * @type {Dayjs} end date
   */
  public get getEndDayjsDate(): Dayjs {
    return dayjs(this.end, SHIFTFORMAT);
  }

  /**
   * Get ISO week number of the shift start date
   * @date 7/11/2022 - 0:28:02
   *
   * @public
   * @readonly
   * @type {number} ISO week number
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
   * @type {boolean} true if shift has pending update
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
   * @type {{ totalHours: number; totalMinutes: number }}
   */
  public get shiftDuration(): { totalHours: number; totalMinutes: number } {
    const totalMinutes = this.getEndDayjsDate.diff(
      this.getStartDayjsDate,
      "minutes"
    );
    const totalHours = totalMinutes / 60;
    return { totalHours, totalMinutes };
  }

  /**
   * Get the base wage for the shift based on the hourly wage and the duration of the shift
   * @date 7/11/2022 - 0:44:42
   *
   * @public
   * @readonly
   * @type {number}
   */
  public get getBaseWage(): number {
    if (!this.hourlyWage) {
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
    try {
      // Add pending update to shift
      await setDoc(
        this.docRef,
        { shifts: { [this.id]: { pendingUpdate } } },
        { mergeFields: [`shifts.${this.id}.pendingUpdate`] }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel pending update
   */
  public async cancelUpdate() {
    try {
      // Remove pending update from shift
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
   * @param {string} taskId - The task to change
   * @param {boolean} status - The new status
   */
  public async changeTask(taskId: string, status: boolean) {
    if (!this.tasks?.[taskId]) {
      // If task does not exist, throw error
      throw new Error("Task does not exist");
    }
    try {
      // Update task status
      await setDoc(
        this.docRef,
        {
          shifts: { [this.id]: { tasks: { [taskId]: { status } } } },
        },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete shift
   */
  public async delete() {
    try {
      // Put shift in deleting state
      await setDoc(
        this.docRef,
        { shifts: { [this.id]: { deleting: true } } },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Restore a pending deletion shift
   */
  public async restore() {
    try {
      // Remove deleting state from shift
      await setDoc(
        this.docRef,
        { shifts: { [this.id]: { deleting: false } } },
        { merge: true }
      );
    } catch (error) {
      throw error;
    }
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
    if (!this.hourlyWage) {
      // If hourly wage is not set, set default values to 0 and return
      this.wageData = {
        normalHours: 0,
        overtimeHours: 0,
        totalHours: 0,
        normalWage: 0,
        overtimeWage: 0,
        totalWage: 0,
      };
      return;
    }

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
