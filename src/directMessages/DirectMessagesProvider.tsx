import { collection, doc, query, Timestamp, where } from "firebase/firestore";
import React, { createContext, ReactNode, useCallback, useEffect } from "react";
import { FIRESTORE } from "../utils/firebase";
import { useCuttinboard } from "../cuttinboard";
import { useAppSelector, useAppThunkDispatch } from "../reduxStore/utils";
import {
  createDmThunk,
  directMessagesSelector,
  selectDirectMessagesError,
  selectDirectMessagesLoading,
  selectDirectMessagesLoadingStatus,
  selectSelectedDirectMessage,
  setDms,
  setDMsError,
  setDMsLoading,
  setSelectedDirectMessage,
  toggleMuteChatThunk,
  useDirectMessagesDispatch,
} from "./directMessages.slice";
import { collectionData } from "rxfire/firestore";
import { defaultIfEmpty } from "rxjs";
import {
  createDMId,
  ICuttinboardUser,
  IDirectMessage,
  IEmployee,
} from "@cuttinboard-solutions/types-helpers";
import { directMessageConverter } from "./directMessageUtils";

/**
 * The interface for the context data used by the DirectMessage component.
 */
export interface DirectMessagesProviderContextProps {
  /**
   * A function that starts a new direct message with the specified user.
   * @param recipient The recipient of the direct message.
   * @returns The ID of the new direct message chat.
   */
  startNewDirectMessageChat: (
    recipient: ICuttinboardUser | IEmployee
  ) => string;
  toggleMuteChat: (dm: IDirectMessage) => void;
  selectedDirectMessage: IDirectMessage | null | undefined;
  selectDirectMessage: (dmId: string | null) => void;
  directMessages: IDirectMessage[];
  loading: boolean;
  error: string | undefined;
}

/**
 * The context used by the DirectMessage component.
 */
export const DirectMessagesProviderContext =
  createContext<DirectMessagesProviderContextProps>(
    {} as DirectMessagesProviderContextProps
  );

interface DirectMessagesProviderProps {
  children: ReactNode;
}

export function DirectMessagesProvider({
  children,
}: DirectMessagesProviderProps) {
  const { user, onError } = useCuttinboard();
  const dispatch = useDirectMessagesDispatch();
  const thunkDispatch = useAppThunkDispatch();
  const directMessages = useAppSelector(directMessagesSelector.selectAll);
  const selectedDirectMessage = useAppSelector(selectSelectedDirectMessage);
  const loading = useAppSelector(selectDirectMessagesLoading);
  const loadingStatus = useAppSelector(selectDirectMessagesLoadingStatus);
  const error = useAppSelector(selectDirectMessagesError);

  useEffect(() => {
    if (loadingStatus !== "succeeded") {
      dispatch(setDMsLoading("pending"));
    }

    const queryRef = query(
      collection(FIRESTORE, "DirectMessages"),
      where("membersList", "array-contains", user.uid)
    ).withConverter(directMessageConverter);

    const subscription = collectionData(queryRef)
      .pipe(defaultIfEmpty(new Array<IDirectMessage>()))
      .subscribe({
        next: (dms) => {
          dispatch(setDms(dms));
        },
        error: (error) => {
          dispatch(setDMsError(error.message));
          onError(error);
        },
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const startNewDirectMessageChat = useCallback(
    ({ id, name, lastName, avatar }: IEmployee | ICuttinboardUser) => {
      if (user.uid === id) {
        throw new Error(
          "You cannot start a direct message chat with yourself."
        );
      }

      if (!user.displayName) {
        throw new Error(
          "You must have a display name to start a direct message."
        );
      }

      const chatId = createDMId(user.uid, id);

      if (directMessages.some((chat) => chat.id === chatId)) {
        return chatId;
      }

      const docRef = doc(FIRESTORE, "DirectMessages", chatId);

      const newDM: IDirectMessage = {
        createdAt: Timestamp.now().toMillis(),
        members: {
          [user.uid]: {
            id: user.uid,
            name: user.displayName,
            avatar: user.photoURL,
          },
          [id]: {
            id,
            name: `${name} ${lastName}`,
            avatar,
          },
        },
        membersList: [user.uid, id],
        id: chatId,
        refPath: docRef.path,
      };

      thunkDispatch(createDmThunk(newDM)).catch(onError);

      return chatId;
    },
    [directMessages, user, thunkDispatch]
  );

  const toggleMuteChat = useCallback(
    (dm: IDirectMessage) => {
      thunkDispatch(toggleMuteChatThunk(dm)).catch(onError);
    },
    [thunkDispatch]
  );

  const selectDirectMessage = useCallback(
    (dmId: string) => {
      dispatch(setSelectedDirectMessage(dmId));
    },
    [dispatch]
  );

  return (
    <DirectMessagesProviderContext.Provider
      value={{
        startNewDirectMessageChat,
        toggleMuteChat,
        selectedDirectMessage,
        selectDirectMessage,
        directMessages,
        loading,
        error,
      }}
    >
      {children}
    </DirectMessagesProviderContext.Provider>
  );
}
