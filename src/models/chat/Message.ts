import { Attachment } from "./Attachment";
import { MessageType } from "./MessageType";
import { Sender } from "./Sender";

/**
 * Mensaje
 */

export type Message<T extends number | object = number> = {
  id: string;
  /**
   * Texto del mensaje
   */
  message: string;
  /**
   * Momento de creación del mensaje
   */
  createdAt: T;
} & (
  | {
      type: "system";
      systemType: "start" | "others";
    }
  | {
      /**
       * Tipo de mensaje
       */
      type: MessageType;
      /**
       * Enlace al recurso adjuntado al mensaje
       */
      srcUrl?: string;
      /**
       * Mesaje al cuál este mensaje contesta, en caso de ser una mensaje de respuesta
       */
      replyTarget?: Message & { type: MessageType };
      /**
       * Usuario que ha enviado el mensaje
       */
      sender: Sender;
      /**
       * El adjunto del mensaje he sido subido a nuestra nube?
       */
      uploaded?: boolean;

      attachment?: Attachment;

      reactions?: Record<string, string>;

      notificationData?: { tokens?: string[]; locationName: string };

      seenBy?: Record<string, boolean>;
    }
);
