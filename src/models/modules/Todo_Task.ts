import { Timestamp } from "@firebase/firestore";

/**
 * Objeto de tarea
 */
export type Todo_Task = {
  /**
   * Texto de la tarea
   */
  name: string;
  /**
   * Estado de la tarea.
   * @type {boolean} completada / no completada
   */
  status: boolean;
  /**
   * Marca de tiempo en la cuál fue creada la tarea
   */
  createdAt: Timestamp;
};
