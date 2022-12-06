/**
 * Represents data for the schedule form.
 */
export type ScheduleSettings = {
  /**
   * Over-time settings for the week.
   */
  ot_week: {
    /**
     * Whether over-time is enabled for the week.
     */
    enabled: boolean;

    /**
     * The maximum number of over-time hours allowed for the week.
     */
    hours: number;

    /**
     * The over-time multiplier for the week.
     */
    multiplier: number;
  };

  /**
   * Over-time settings for the day.
   */
  ot_day: {
    /**
     * Whether over-time is enabled for the day.
     */
    enabled: boolean;

    /**
     * The maximum number of over-time hours allowed for the day.
     */
    hours: number;

    /**
     * The over-time multiplier for the day.
     */
    multiplier: number;
  };

  /**
   * An optional array of preset time ranges for the schedule.
   */
  presetTimes?: {
    /**
     * The start time for the preset time range.
     */
    start: string;

    /**
     * The end time for the preset time range.
     */
    end: string;
  }[];
};
