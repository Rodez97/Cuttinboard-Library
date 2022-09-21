import { FirebaseSignature } from "../FirebaseSignature";
import { PrimaryFirestore } from "../PrimaryFirestore";

/**
 * Archivo
 * @description Lo utilizamos para reflejar los objetos de storage en la app de drawers
 */
export type Cuttinboard_File = FirebaseSignature &
  PrimaryFirestore & {
    /**
     * Nombre del archivo
     */
    name: string;
    /**
     * Referencia/Ruta del archivo en storage
     */
    storagePath: string;
    /**
     * MimeType del archivo
     */
    fileType: string;
    /**
     * Tamaño en bytes del archivo
     */
    size: number;
  };
