/**
 * Adjunto del mensaje
 */
export type Attachment = {
  /**
   * Tipo de archivo
   */
  mimeType: string;
  /**
   * Si es subido a nuestra nube:
   * - Referencia al objeto en Firebase Cloud Storage.
   *
   * Si es solo un enlace:
   * - Enlace directo al recurso.
   */
  source: string;
  filename: string;
};
