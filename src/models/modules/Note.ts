import { FirebaseSignature } from "../FirebaseSignature";
import { PrimaryFirestore } from "../PrimaryFirestore";

/**
 * Interfaz de la app de Notas
 */

export type Note = PrimaryFirestore &
  FirebaseSignature & {
    /**
     * Título de la nota
     */
    title: string;
    /**
     * Contenido de la nota
     */
    content: string;

    authorName: string;
  };
