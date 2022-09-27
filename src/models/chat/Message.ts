import { Attachment } from "./Attachment";
import { MessageContentType } from "./MessageContentType";
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
      systemType: "start";
    }
  | ({
      /**
       * Mesaje al cuál este mensaje contesta, en caso de ser una mensaje de respuesta
       */
      replyTarget?: Message & {
        type: "attachment" | "youtube" | "mediaUri" | "text";
      };
      /**
       * Usuario que ha enviado el mensaje
       */
      sender: Sender;
      reactions?: Record<string, { emoji: string; name: string }>;
      locationName: string;
      /**
       * Solo aplicable para chats 1-1
       */
      seenBy?: Record<string, boolean>;
    } & (
      | {
          /**
           * Tipo de mensaje
           */
          type: "attachment";

          attachment: Attachment;

          contentType: MessageContentType;
        }
      | {
          /**
           * Tipo de mensaje
           */
          type: "youtube";
          /**
           * Enlace al recurso adjuntado al mensaje
           */
          sourceUrl: string;
        }
      | {
          /**
           * Tipo de mensaje
           */
          type: "mediaUri";
          /**
           * Enlace al recurso adjuntado al mensaje
           */
          sourceUrl?: string;
          contentType: MessageContentType;
        }
      | {
          /**
           * Tipo de mensaje
           */
          type: "text";
        }
    ))
);
