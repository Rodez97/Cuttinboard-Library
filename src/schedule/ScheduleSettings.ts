/**
 * Represents data for the schedule form.
 */
export interface IScheduleSettings {
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
}

export class ScheduleSettings implements IScheduleSettings {
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
  presetTimes?:
    | {
        /**
         * The start time for the preset time range.
         */
        start: string;
        /**
         * The end time for the preset time range.
         */
        end: /**
         * Over-time settings for the week.
         */ string;
      }[]
    | undefined;

  /**
   * Default value
   */
  public static default = new ScheduleSettings({
    ot_week: {
      enabled: true,
      hours: 40,
      multiplier: 1.5,
    },
    ot_day: {
      enabled: false,
      hours: 8,
      multiplier: 1.5,
    },
  });

  constructor(data: IScheduleSettings) {
    this.ot_week = data.ot_week;
    this.ot_day = data.ot_day;
    this.presetTimes = data.presetTimes;
  }
}
