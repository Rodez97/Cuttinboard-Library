import { ModuleFirestoreConverter } from "../modules";
import { Todo_Task } from "../modules/Todo_Task";
import { PrimaryFirestore } from "../PrimaryFirestore";

/**
 * Turno de trabajo
 */
export type Shift = PrimaryFirestore &
  ({
    /**
     * Inicio del turno
     */
    start: string;
    /**
     * Fin del turno
     */
    end: string;
    /**
     * Posición que desempeñarás durante el turno
     */
    position?: string;
    /**
     * Tareas asignadas para ese turno
     */
    tasks?: Record<string, Todo_Task>;
    /**
     * Notas del turno
     */
    notes?: string;
    employeeId: string;
    break?: number;
    hourlyWage?: number;
  } & (
    | {
        altId: "repeat";
        repeatDay?: number;
      }
    | { altId: string }
  ));

export const ShiftConverter = ModuleFirestoreConverter<Shift>();
