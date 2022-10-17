import { ModuleFirestoreConverter } from "../modules";
import { PrimaryFirestore } from "../PrimaryFirestore";
import { Schedule_DayStats } from "./Schedule_DayStats";

export type ScheduleDoc = PrimaryFirestore & {
  isPublished: boolean;
  locationId: string;
  organizationId: string;
  notes?: string;
  stats?: Record<string, string | number>;
  weekId: string;
  statsByDay?: Record<number, Schedule_DayStats>;
  year: number;
  month: number;
  weekNumber: number;
};

export const ScheduleDocConverter = ModuleFirestoreConverter<ScheduleDoc>();
