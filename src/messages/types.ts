import { IMessage } from "@cuttinboard-solutions/types-helpers";
import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";

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

export type SubmitMessageParams = {
  messageText: string;
  uploadAttachment?:
    | {
        uploadFn: (messageId: string) => Promise<string>;
        image: string;
      }
    | undefined;
};

export const messagesConverter = {
  toFirestore(object: IMessage): DocumentData {
    return object;
  },
  fromFirestore(
    value: QueryDocumentSnapshot<IMessage>,
    options: SnapshotOptions
  ): IMessage {
    return value.data(options);
  },
};
