import { useCallback, useEffect, useMemo, useState } from "react";
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
  query,
  ref as RTDBRef,
} from "firebase/database";
import useListReducer from "./useListReducer";
import { orderBy } from "lodash";
import { Message } from "models";
import { Database } from "./../firebase";

function useBaseMessaging(chatPath: string) {
  const [messages, dispatch] = useListReducer();
  const [noMoreMessages, setNoMoreMessages] = useState(false);

  useEffect(() => {
    const deletedRef = RTDBRef(Database, chatPath);
    const reference = query(
      RTDBRef(Database, chatPath),
      orderByChild("createdAt"),
      limitToLast(50)
    );

    const onChildAdded = (snapshot: DataSnapshot | null) => {
      dispatch({
        type: "add",
        snapshot: { ...snapshot.val(), id: snapshot.key },
      });
    };

    const onChildChanged = (snapshot: DataSnapshot | null) => {
      dispatch({
        type: "change",
        snapshot: { ...snapshot.val(), id: snapshot.key },
      });
    };

    const onChildRemoved = (snapshot: DataSnapshot | null) => {
      dispatch({
        type: "remove",
        snapshot: { ...snapshot.val(), id: snapshot.key },
      });
    };

    const onError = (error: Error) => {
      dispatch({ type: "error", error });
    };

    const onValue = (snapshots: DataSnapshot[] | null) => {
      dispatch({
        type: "value",
        snapshots: snapshots.map((snp) => ({
          ...snp.val(),
          id: snp.key,
        })),
      });
    };

    let childAddedHandler: ReturnType<typeof firebaseOnChildAdded> | undefined;
    const onInitialLoad = (snapshot: DataSnapshot) => {
      const snapshotVal = snapshot.val();
      let childrenToProcess = snapshotVal
        ? Object.keys(snapshot.val()).length
        : 0;

      // If the list is empty then initialise the hook and use the default `onChildAdded` behaviour
      if (childrenToProcess === 0) {
        childAddedHandler = firebaseOnChildAdded(
          reference,
          onChildAdded,
          onError
        );
        onValue([]);
      } else {
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

        childAddedHandler = firebaseOnChildAdded(
          reference,
          onChildAddedWithoutInitialLoad,
          onError
        );
      }
    };

    firebaseOnValue(reference, onInitialLoad, onError, { onlyOnce: true });
    const childChangedHandler = firebaseOnChildChanged(
      reference,
      onChildChanged,
      onError
    );
    const childRemovedHandler = firebaseOnChildRemoved(
      deletedRef,
      onChildRemoved,
      onError
    );

    return () => {
      off(reference, "child_added", childAddedHandler);
      off(reference, "child_changed", childChangedHandler);
      off(deletedRef, "child_removed", childRemovedHandler);
    };
  }, [dispatch, chatPath]);

  const allMessages = useMemo(() => {
    if (messages.loading || messages.error) {
      return [];
    }
    return orderBy(messages.value, "createdAt", "desc");
  }, [messages]);

  const fetchOlderMessages = useCallback(
    async () =>
      new Promise<void>((resolve, reject) => {
        if (allMessages?.length === 0 || noMoreMessages) {
          resolve();
        }
        const { createdAt, ...firstMessage } =
          allMessages[allMessages.length - 1];

        if (
          firstMessage.type === "system" &&
          firstMessage.systemType === "start"
        ) {
          setNoMoreMessages(true);
          resolve();
        }
        try {
          const chatsRef = query(
            RTDBRef(Database, chatPath),
            orderByChild("createdAt"),
            limitToLast(20),
            endBefore(createdAt)
          );

          return firebaseOnValue(
            chatsRef,
            (snapshot) => {
              const olderMessages: Message[] = [];

              snapshot.forEach((snp) => {
                olderMessages.push({ ...snp.val(), id: snp.key });
              });

              dispatch({
                type: "appendOlder",
                snapshot: olderMessages,
              });

              resolve();
            },
            {
              onlyOnce: true,
            }
          );
        } catch (error) {
          reject(error);
        }
      }),
    [noMoreMessages, allMessages, dispatch]
  );

  return {
    messages,
    dispatch,
    allMessages,
    noMoreMessages,
    chatPath,
    fetchOlderMessages,
  };
}

export default useBaseMessaging;
