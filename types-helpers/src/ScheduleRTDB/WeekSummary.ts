import { WageDataByDay } from "./ShiftData";

/**
 * Total summary of a week's worth of shifts.
 */

export type WeekSummary = {
  /**
   * Summary of the whole week.
   */
  total: {
    /**
     * The hours worked without overtime.
     */
    normalHours: number;
    /**
     * The hours worked with overtime.
     */
    overtimeHours: number;
    /**
     * The total hours worked.
     * - This is the sum of normalHours and overtimeHours.
     */
    totalHours: number;
    /**
     * The amount of money earned without overtime.
     */
    normalWage: number;
    /**
     * The amount of money earned in overtime hours.
     */
    overtimeWage: number;
    /**
     * The total amount of money earned.
     */
    totalWage: number;
    /**
     * How many people are scheduled to work.
     */
    totalPeople: number;
    /**
     * How may shifts are scheduled for this week.
     */
    totalShifts: number;
    /**
     * Total projected sales for the week.
     */
    projectedSales: number;
    /**
     * Percentage of wages spent on labor relative to projected sales.
     */
    laborPercentage: number;
  };
  /**
   * Summary of each day of the week.
   */
  byDay: WageDataByDay;
};
