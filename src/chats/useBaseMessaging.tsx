import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DataSnapshot,
  endBefore,
  limitToLast,
  off,
  onChildAdded as firebaseOnChildAdded,
  onChildChanged as firebaseOnChildChanged,
  onChildRemoved as firebaseOnChildRemoved,
  onValue as firebaseOnValue,
  orderByChild,
  push,
  query,
  ref as RTDBRef,
} from "firebase/database";
import useListReducer from "./useMessagesReducer";
import { orderBy } from "lodash";
import { DATABASE, FIRESTORE } from "../utils/firebase";
import { Attachment, Sender } from "./types";
import { Message } from "./Message";
import { useCuttinboard, useCuttinboardLocation } from "../services";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { composeMessage } from "./composeMessage";

function useBaseMessaging(chatId: string, type: "dm" | "conversation") {
  const { user } = useCuttinboard();
  const { location } = useCuttinboardLocation();
  const chatPath = useMemo(() => {
    if (type === "dm") {
      return `directMessages/${chatId}`;
    } else {
      return `conversationMessages/${location.organizationId}/${location.id}/${chatId}`;
    }
  }, [chatId, location.id, location.organizationId, type]);
  const reference = useMemo(
    () =>
      query(
        RTDBRef(DATABASE, chatPath),
        orderByChild("createdAt"),
        limitToLast(50)
      ),
    [DATABASE, chatPath]
  );
  const rootReference = useMemo(
    () => RTDBRef(DATABASE, chatPath),
    [DATABASE, chatPath]
  );
  const [messages, dispatch] = useListReducer();
  const [hasNoMoreMessages, setHasNoMoreMessages] = useState(false);

  const onChildAdded = useCallback(
    (snapshot: DataSnapshot) => {
      dispatch({
        type: "ADD_MESSAGE",
        newMessageData: {
          message: snapshot.val(),
          id: snapshot.key!,
          ref: snapshot.ref,
        },
      });
    },
    [dispatch]
  );

  const onChildChanged = useCallback(
    (snapshot: DataSnapshot) => {
      dispatch({
        type: "UPDATE_MESSAGE",
        message: { message: snapshot.val(), id: snapshot.key! },
      });
    },
    [dispatch]
  );

  const onChildRemoved = useCallback(
    (snapshot: DataSnapshot) => {
      dispatch({
        type: "REMOVE_MESSAGE",
        messageId: snapshot.key!,
      });
    },
    [dispatch]
  );

  const onError = useCallback(
    (error: Error) => {
      dispatch({ type: "ERROR", error });
    },
    [dispatch]
  );

  const onValue = useCallback(
    (snapshots: DataSnapshot[]) => {
      dispatch({
        type: "SET_VALUE",
        rawMessages: snapshots.map((snp) => ({
          message: snp.val(),
          id: snp.key!,
          ref: snp.ref,
        })),
      });
    },
    [dispatch]
  );

  const childAddedHandler = useRef<ReturnType<typeof firebaseOnChildAdded>>();

  const onInitialLoad = useCallback(
    (snapshot: DataSnapshot) => {
      const snapshotVal = snapshot.val();
      let childrenToProcess = snapshotVal ? Object.keys(snapshotVal).length : 0;

      // If the list is empty then initialize the hook and use the default `onChildAdded` behavior
      if (childrenToProcess === 0) {
        childAddedHandler.current = firebaseOnChildAdded(
          reference,
          onChildAdded,
          onError
        );
        onValue([]);
        return;
      }

      // Otherwise, we load the first batch of children all to reduce re-renders
      const children: DataSnapshot[] = [];

      const onChildAddedWithoutInitialLoad = (addedChild: DataSnapshot) => {
        if (childrenToProcess > 0) {
          childrenToProcess--;
          children.push(addedChild);

          if (childrenToProcess === 0) {
            onValue(children);
          }

          return;
        }

        onChildAdded(addedChild);
      };

      childAddedHandler.current = firebaseOnChildAdded(
        reference,
        onChildAddedWithoutInitialLoad,
        onError
      );
    },
    [reference, onChildAdded, onError, onValue]
  );

  const childChangedHandler =
    useRef<ReturnType<typeof firebaseOnChildChanged>>();
  const childRemovedHandler =
    useRef<ReturnType<typeof firebaseOnChildRemoved>>();

  useEffect(() => {
    firebaseOnValue(reference, onInitialLoad, onError, { onlyOnce: true });
    childChangedHandler.current = firebaseOnChildChanged(
      reference,
      onChildChanged,
      onError
    );
    childRemovedHandler.current = firebaseOnChildRemoved(
      rootReference,
      onChildRemoved,
      onError
    );

    return () => {
      offEventListeners();
    };
  }, [
    reference,
    rootReference,
    onInitialLoad,
    onChildChanged,
    onChildRemoved,
    onError,
  ]);

  const offEventListeners = () => {
    off(reference, "child_added", childAddedHandler.current);
    off(reference, "child_changed", childChangedHandler.current);
    off(rootReference, "child_removed", childRemovedHandler.current);
  };

  const allMessages = useMemo(() => {
    if (messages.loading || messages.error) {
      return [];
    }
    return orderBy(messages.messages, "createdAt", "desc");
  }, [messages]);

  const fetchPreviousMessages = useCallback(async () => {
    // Return early if there are no more messages to fetch or if all messages have been fetched
    if (allMessages?.length === 0 || hasNoMoreMessages) {
      return;
    }

    // Get the first message in the message list
    const { createdAt, ...firstMessage } = allMessages[allMessages.length - 1];

    // Check if the first message is a system message with type "start"
    if (firstMessage.type === "system" && firstMessage.systemType === "start") {
      // Set the "noMoreMessages" flag to true to indicate that all messages have been fetched
      setHasNoMoreMessages(true);
      return;
    }

    // Query the database for older messages in the chat
    const chatsRef = query(
      rootReference,
      orderByChild("createdAt"),
      limitToLast(20),
      endBefore(createdAt)
    );

    // Listen for the query results and append the older messages to the message list
    firebaseOnValue(
      chatsRef,
      (snapshot) => {
        const oldMessages: Message[] = [];

        snapshot.forEach((snp) => {
          oldMessages.push(new Message(snp.val(), snp.key!, snp.ref));
        });

        dispatch({
          type: "APPEND_OLDER",
          oldMessages,
        });

        // If the number of messages returned is less than 20, then we know that all messages have been fetched
        if (oldMessages.length < 20) {
          setHasNoMoreMessages(true);
        }

        return;
      },
      {
        onlyOnce: true,
      }
    );
  }, [hasNoMoreMessages, allMessages, dispatch]);

  const submitMessage = useCallback(
    async (
      messageText: string,
      replyTargetMessage: Message | null,
      attachment?: Attachment
    ) => {
      if (!user || !user.displayName) {
        throw new Error("User is not logged in");
      }

      // Create a new object to store the sender information
      const sender: Sender = {
        id: user.uid,
        name: user.displayName,
      };

      // Create a new object to store the message data
      const msg = composeMessage(sender, messageText, replyTargetMessage);

      if (type === "dm") {
        msg.seenBy = { [user.uid]: true };
      } else {
        msg.locationName = globalThis.locationData?.name;
      }

      // Check if there is an attachment
      if (attachment) {
        msg.type = "attachment";
        msg.attachment = attachment;

        // Use destructuring assignment to extract the mime type from the attachment object
        const { mimeType } = attachment;

        // Use a switch statement to determine the type of the message based on the attachment's mime type
        switch (true) {
          case mimeType.includes("image"):
            msg.contentType = "image";
            break;
          case mimeType.includes("video"):
            msg.contentType = "video";
            break;
          case mimeType.includes("audio"):
            msg.contentType = "audio";
            break;
          default:
            msg.contentType = "file";
            break;
        }
      }

      await push(RTDBRef(DATABASE, chatPath), msg);
      if (type === "dm") {
        await updateDoc(doc(FIRESTORE, "DirectMessage", chatId), {
          recentMessage: serverTimestamp(),
        });
      }
    },
    []
  );

  const getAttachmentFilePath = useCallback(
    (fileName: string) =>
      type === "dm"
        ? `directMessages/${chatId}/${fileName}`
        : `organizations/${location.organizationId}/locations/${location.id}/conversationMessages/${chatId}/${fileName}`,
    [chatId, location, type]
  );

  return {
    messages,
    dispatch,
    allMessages,
    hasNoMoreMessages,
    fetchPreviousMessages,
    submitMessage,
    getAttachmentFilePath,
  };
}

export default useBaseMessaging;
