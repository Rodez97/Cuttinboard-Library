import { Timestamp } from "@firebase/firestore";
import { FirebaseSignature } from "../FirebaseSignature";
import { PrimaryFirestore } from "../PrimaryFirestore";
import { Todo_Task } from "./Todo_Task";

/**
 * Interfaz de la app Tareas
 */

export type Todo = PrimaryFirestore &
  FirebaseSignature & {
    name: string;
    description?: string;
    /**
     * Id del usuario al cual fue asignada la tarea
     */
    assignedTo?: { id: string; name: string; email: string };
    /**
     * Fecha límite antes de la cual se tiene que completar la tarea
     */
    dueDate?: Timestamp;
    /**
     * Lista de tareas a realizar
     */
    tasks?: Record<string, Todo_Task>;
  };
