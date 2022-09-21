import { ModuleFirestoreConverter } from "../modules";
import { PrimaryFirestore } from "../PrimaryFirestore";
import { Schedule_DayStats } from "./Schedule_DayStats";

/**
 * Documento contenedor de los turnos de una semana
 */

export type ScheduleDoc = PrimaryFirestore & {
  /**
   * Está publicado el horario?
   */
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
