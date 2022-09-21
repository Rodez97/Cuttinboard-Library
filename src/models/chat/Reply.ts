import { Attachment } from "./Attachment";
import { MessageType } from "./MessageType";

export type Reply = {
  /**
   * ID del mensaje al cuál se responde
   */
  id: string;
  /**
   * Texto del mensaje
   */
  message: string;
  /**
   * Tipo de mensaje
   */
  type?: MessageType;
  /**
   * Enlace al recurso adjuntado al mensaje
   */
  srcUrl?: string;
  /**
   * El adjunto del mensaje he sido subido a nuestra nube?
   */
  uploaded?: boolean;
  /**
   * Usuario que ha enviado el mensaje
   */
  sender: {
    /**
     * UID del usuario
     */
    id: string;
    /**
     * Nombre del usuario
     */
    name: string;
    /**
     * Enlace a la imagen de perfil del usuario
     */
    avatar: string;
  };
  /**
   * Adjunto del mensaje
   */
  attachment?: Attachment;
};
