import React, { ReactNode, useCallback } from "react";
import { useChatPaths } from "./useChatPaths";
import { SubmitMessageParams, messagesConverter } from "./types";
import {
  IMessage,
  MessageProviderMessagingType,
} from "@cuttinboard-solutions/types-helpers";
import { useCuttinboard } from "../cuttinboard/useCuttinboard";
import { FIRESTORE } from "../utils/firebase";
import { useMessagesData } from "./useMessagesData";
import {
  DocumentData,
  DocumentReference,
  FirestoreError,
  collection,
  deleteDoc,
  doc,
  endBefore,
  getDocs,
  limitToLast,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { nanoid } from "nanoid";

/**
 * The props for the Direct Messages context.
 */
export interface IMessagesContext {
  fetchPreviousMessages: () => Promise<void>;
  messages: IMessage[];
  noMoreMessages: boolean;
  submitMessage: (props: SubmitMessageParams) => Promise<void>;
  getAttachmentFilePath: (fileName: string) => string;
  removeMessage: (message: IMessage) => Promise<void>;
  error?: FirestoreError | undefined;
  loading: boolean;
}

export const MessagesContext = React.createContext<IMessagesContext>(
  {} as IMessagesContext
);

/**
 * A component that provides the Direct Messages context.
 */
export function MessagesProvider({
  children,
  messagingType,
  batchSize = 12,
  initialLoadSize = 12,
}: {
  /**
   * The children of the component.
   */
  children: ReactNode;
  /**
   * The type of the chat that the context is for.
   */
  messagingType: MessageProviderMessagingType;
  batchSize: number;
  initialLoadSize: number;
}) {
  const { user, onError } = useCuttinboard();
  const { messagesPath, storagePath } = useChatPaths(messagingType);
  const {
    messages,
    loading,
    error,
    noMoreMessages,
    setNoMoreMessages,
    dispatch,
  } = useMessagesData(messagesPath, initialLoadSize);

  const fetchPreviousMessages = useCallback(async () => {
    // Return early if there are no more messages to fetch or if all messages have been fetched
    if (messages.length === 0 || noMoreMessages) {
      return;
    }

    // Get the latest message in the message list
    const { createdAt } = messages[messages.length - 1];

    // Query the database for older messages in the chat
    const chatsRef = query(
      collection(FIRESTORE, messagesPath),
      orderBy("createdAt"),
      endBefore(createdAt),
      limitToLast(batchSize)
    ).withConverter(messagesConverter);

    // Listen for the query results and append the older messages to the message list
    const oldMessagesSnapshot = await getDocs(chatsRef);
    const oldMessages: IMessage[] = [];

    oldMessagesSnapshot.forEach((oldMessage) => {
      oldMessages.push(oldMessage.data());
    });

    if (oldMessages.length === 0) {
      setNoMoreMessages(true);
      return;
    }

    dispatch({ type: "APPEND_OLDER_MESSAGES", payload: oldMessages });

    // If the number of messages returned is less than `batchSize`, then we know that all messages have been fetched
    if (oldMessages.length < batchSize) {
      setNoMoreMessages(true);
    }
  }, [
    messages,
    noMoreMessages,
    messagesPath,
    batchSize,
    dispatch,
    setNoMoreMessages,
  ]);

  const submitMessage = useCallback(
    async ({ messageText, uploadAttachment }: SubmitMessageParams) => {
      if (!user.displayName) {
        throw new Error("User must have a display name to send messages");
      }

      const newMessageId = nanoid();

      const reference = doc(FIRESTORE, `${messagesPath}/${newMessageId}`);

      // Create a new object to store the message data
      const msg: IMessage = {
        user: {
          _id: user.uid,
          name: user.displayName,
          avatar: user.photoURL || "",
        },
        createdAt: new Date().getTime(),
        _id: newMessageId,
        text: messageText,
      };

      await sendMessage(msg, reference, uploadAttachment);
    },
    [messagesPath, user.displayName, user.photoURL, user.uid]
  );

  const getAttachmentFilePath = useCallback(
    (fileName: string) => `${storagePath}/${fileName}`,
    [storagePath]
  );

  const removeMessage = useCallback(
    async (message: IMessage) => {
      try {
        const reference = doc(FIRESTORE, `${messagesPath}/${message._id}`);
        await deleteDoc(reference);
      } catch (error) {
        onError(error);
      }
    },
    [messagesPath, onError]
  );

  return (
    <MessagesContext.Provider
      value={{
        fetchPreviousMessages,
        noMoreMessages,
        submitMessage,
        getAttachmentFilePath,
        messages,
        removeMessage,
        error,
        loading,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export const sendMessage = async (
  message: IMessage,
  reference: DocumentReference<DocumentData>,
  uploadAttachment?: SubmitMessageParams["uploadAttachment"]
) => {
  let updatedMessage: IMessage;

  if (uploadAttachment) {
    const image = await uploadAttachment.uploadFn(message._id);
    updatedMessage = {
      ...message,
      image,
    };
  } else {
    updatedMessage = message;
  }

  await setDoc(reference, updatedMessage, { merge: true });
};
