import { IMessage } from "@cuttinboard-solutions/types-helpers";
import { ListenEvent } from "rxfire/database";

export type MessageConstructorOptions =
  | {
      uploadAttachment?: (messageId: string) => Promise<string>;
      isDM?: false;
    }
  | {
      uploadAttachment?: (messageId: string) => Promise<string>;
      isDM: true;
      dmId: string;
    };

export type MessagesReducerAction =
  | {
      type: ListenEvent.added;
      message: IMessage;
    }
  | {
      type: ListenEvent.changed;
      message: IMessage;
    }
  | {
      type: ListenEvent.removed;
      messageId: string;
    }
  | { type: "reset" }
  | {
      type: "append_older";
      oldMessages: Record<string, IMessage>;
    };

export type SubmitMessageParams =
  | {
      messageText: string;
      uploadAttachment?:
        | {
            uploadFn: (messageId: string) => Promise<string>;
            image: string;
          }
        | undefined;
    }
  | {
      messageText?: string | undefined;
      uploadAttachment: {
        uploadFn: (messageId: string) => Promise<string>;
        image: string;
      };
    };
