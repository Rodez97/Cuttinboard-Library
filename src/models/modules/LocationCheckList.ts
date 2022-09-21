import { Timestamp } from "@firebase/firestore";
import { FirebaseSignature } from "../FirebaseSignature";
import { PrimaryFirestore } from "../PrimaryFirestore";
import { Todo_Task } from "./Todo_Task";

/**
 * Interfaz de la app Tareas
 */

export type LocationCheckList = PrimaryFirestore &
  FirebaseSignature & {
    name: string;
    description?: string;
    /**
     * Id del usuario que firma la checklist
     */
    signedBy?: string;
    /**
     * Fecha a la que corresponde la checklist
     */
    checklistDate?: Timestamp;
    /**
     * Lista de tareas a realizar
     */
    tasks?: Record<string, Todo_Task>;
  };
