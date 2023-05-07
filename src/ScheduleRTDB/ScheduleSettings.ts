export interface IScheduleSettings {
  ot_week: {
    enabled: boolean;
    hours: number;
    multiplier: number;
  };
  ot_day: {
    enabled: boolean;
    hours: number;
    multiplier: number;
  };
  presetTimes?: {
    start: string;
    end: string;
  }[];
}

export const DefaultScheduleSettings: IScheduleSettings = {
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
};
