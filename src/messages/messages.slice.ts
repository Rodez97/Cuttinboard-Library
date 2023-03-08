import {
  AnyAction,
  createEntityAdapter,
  createSelector,
  createSlice,
  Dispatch,
  EntityState,
  PayloadAction,
  ThunkDispatch,
} from "@reduxjs/toolkit";
import {
  refFromURL,
  remove,
  set as setDatabase,
  update,
} from "firebase/database";
import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { clone, isUndefined, keyBy, omitBy, set } from "lodash";
import { useDispatch } from "react-redux";
import { SubmitMessageParams } from ".";
import { AUTH, DATABASE, FIRESTORE } from "../utils";
import { AppThunk, RootState } from "../reduxStore/utils";
import { LoadingStatus } from "../models";
import {
  IMessage,
  IMessageReaction,
} from "@cuttinboard-solutions/types-helpers";

export interface ChatRoomEntry {
  id: string;
  messages: EntityState<IMessage> & LoadingStatus;
}

const roomsAdapter = createEntityAdapter<ChatRoomEntry>();
const messagesAdapter = createEntityAdapter<IMessage>({
  sortComparer: (a, b) => b.createdAt - a.createdAt,
});

export const addMessageThunk =
  (
    chatId: string,
    isDm: boolean,
    message: IMessage,
    uploadAttachment?: SubmitMessageParams["uploadAttachment"]
  ): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch(
      addMessage({
        chatId,
        message,
      })
    );

    const updatedMessage = clone(message);

    try {
      if (uploadAttachment) {
        const image = await uploadAttachment.uploadFn(message.id);
        updatedMessage.image = image;
      }

      const { messageRefUrl, ...messageData } = updatedMessage;
      await setDatabase(refFromURL(DATABASE, messageRefUrl), {
        ...omitBy(messageData, isUndefined),
      });

      if (isDm) {
        await updateDoc(doc(FIRESTORE, "DirectMessages", chatId), {
          recentMessage: Timestamp.now().toMillis(),
        });
      }
    } catch (error) {
      dispatch(
        deleteMessage({
          chatId,
          messageId: message.id,
        })
      );
      throw error;
    }
  };

export const addMessageReactionThunk =
  (
    chatId: string,
    message: IMessage,
    emoji?: string
  ): AppThunk<Promise<void>> =>
  async (dispatch) => {
    if (!AUTH.currentUser) {
      throw new Error("User is not authenticated");
    }
    const serverUpdates: { [key: string]: IMessageReaction | null } = {};
    let updatedMessage = message;
    if (emoji) {
      const emojiReaction = {
        emoji,
        name:
          AUTH.currentUser.displayName ??
          AUTH.currentUser.email ??
          AUTH.currentUser.uid,
      };
      set(updatedMessage, ["reactions", AUTH.currentUser.uid], emojiReaction);
      serverUpdates[`/reactions/${AUTH.currentUser.uid}`] = emojiReaction;
    } else if (message.reactions) {
      const { [AUTH.currentUser.uid]: _, ...reactions } = message.reactions;
      updatedMessage = {
        ...message,
        reactions,
      };
      serverUpdates[`/reactions/${AUTH.currentUser.uid}`] = null;
    }
    dispatch(
      upsertMessage({
        chatId,
        message: updatedMessage,
      })
    );
    try {
      await update(refFromURL(DATABASE, message.messageRefUrl), serverUpdates);
    } catch (error) {
      dispatch(
        upsertMessage({
          chatId,
          message,
        })
      );
      throw error;
    }
  };

export const deleteMessageThunk =
  (chatId: string, message: IMessage): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch(
      deleteMessage({
        chatId,
        messageId: message.id,
      })
    );
    try {
      await remove(refFromURL(DATABASE, message.messageRefUrl));
    } catch (error) {
      dispatch(
        upsertMessage({
          chatId,
          message,
        })
      );
      throw error;
    }
  };

const messagesSlice = createSlice({
  name: "messages",
  initialState: roomsAdapter.getInitialState(),
  reducers: {
    setMessages(
      state,
      action: PayloadAction<{
        chatId: string;
        messages: IMessage[];
      }>
    ) {
      const { chatId, messages } = action.payload;
      const roomEntry = state.entities[chatId];
      if (!roomEntry) {
        roomsAdapter.addOne(state, {
          id: chatId,
          messages: messagesAdapter.getInitialState<ChatRoomEntry["messages"]>({
            ids: messages.map((m) => m.id),
            entities: keyBy(messages, (m) => m.id),
            loading: "succeeded",
          }),
        });
      } else {
        const { loading, error } = roomEntry.messages;
        if (loading === "failed" || error) {
          roomEntry.messages.error = undefined;
        }
        roomEntry.messages.loading = "succeeded";
        messagesAdapter.setAll(roomEntry.messages, messages);
      }
    },
    upsertMessage(
      state,
      action: PayloadAction<{
        chatId: string;
        message: IMessage;
      }>
    ) {
      const { chatId, message } = action.payload;
      const roomEntry = state.entities[chatId];
      if (!roomEntry) {
        console.warn("Message received for unknown chat room", chatId);
        return;
      }
      messagesAdapter.upsertOne(roomEntry.messages, message);
    },
    updateMessage(
      state,
      action: PayloadAction<{
        chatId: string;
        message: IMessage;
      }>
    ) {
      const { chatId, message } = action.payload;
      const roomEntry = state.entities[chatId];
      if (!roomEntry) {
        console.warn("Message received for unknown chat room", chatId);
        return;
      }
      messagesAdapter.updateOne(roomEntry.messages, {
        id: message.id,
        changes: message,
      });
    },
    addMessage(
      state,
      action: PayloadAction<{
        chatId: string;
        message: IMessage;
      }>
    ) {
      const { chatId, message } = action.payload;
      const roomEntry = state.entities[chatId];
      if (!roomEntry) {
        return;
      }
      messagesAdapter.addOne(roomEntry.messages, message);
    },
    deleteMessage(
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
      }>
    ) {
      const { chatId, messageId } = action.payload;
      const roomEntry = state.entities[chatId];
      if (!roomEntry) {
        return;
      }
      messagesAdapter.removeOne(roomEntry.messages, messageId);
    },
    appendOlder(
      state,
      action: PayloadAction<{
        chatId: string;
        messages: IMessage[];
      }>
    ) {
      const { chatId, messages } = action.payload;
      const roomEntry = state.entities[chatId];
      if (!roomEntry) {
        return;
      }
      messagesAdapter.addMany(roomEntry.messages, messages);
    },
    setMessagesLoading(
      state,
      action: PayloadAction<{
        chatId: string;
        loading: LoadingStatus["loading"];
      }>
    ) {
      const { chatId, loading } = action.payload;
      const roomEntry = state.entities[chatId];
      if (!roomEntry) {
        roomsAdapter.addOne(state, {
          id: chatId,
          messages: messagesAdapter.getInitialState<ChatRoomEntry["messages"]>({
            ids: [],
            entities: {},
            loading,
          }),
        });
      } else {
        const { error } = roomEntry.messages;
        if (error) {
          roomEntry.messages.error = undefined;
        }
        roomEntry.messages.loading = loading;
      }
    },
    setMessagesError(
      state,
      action: PayloadAction<{
        chatId: string;
        error: LoadingStatus["error"];
      }>
    ) {
      const { chatId, error } = action.payload;
      const roomEntry = state.entities[chatId];
      if (!roomEntry) {
        roomsAdapter.addOne(state, {
          id: chatId,
          messages: messagesAdapter.getInitialState<ChatRoomEntry["messages"]>({
            ids: [],
            entities: {},
            loading: "failed",
            error,
          }),
        });
      } else {
        roomEntry.messages.loading = "failed";
        roomEntry.messages.error = error;
      }
    },
  },
});

export const {
  setMessages,
  upsertMessage,
  deleteMessage,
  appendOlder,
  setMessagesError,
  setMessagesLoading,
  addMessage,
} = messagesSlice.actions;

type MessagesActions =
  | ReturnType<typeof upsertMessage>
  | ReturnType<typeof deleteMessage>
  | ReturnType<typeof appendOlder>
  | ReturnType<typeof setMessages>
  | ReturnType<typeof setMessagesError>
  | ReturnType<typeof setMessagesLoading>
  | ReturnType<typeof addMessage>;

export const messagesReducer = messagesSlice.reducer;

export const useMessagesDispatch = () =>
  useDispatch<Dispatch<MessagesActions>>();

export const useMessagesThunkDispatch = () =>
  useDispatch<ThunkDispatch<EntityState<ChatRoomEntry>, void, AnyAction>>();

export const roomSelectors = roomsAdapter.getSelectors<RootState>(
  (state) => state.messages
);
export const messagesSelectors = messagesAdapter.getSelectors();

export const makeMessagesSelector = (chatId: string) =>
  createSelector(
    (state: RootState) => roomSelectors.selectById(state, chatId),
    (selectedBoard) =>
      selectedBoard ? messagesSelectors.selectAll(selectedBoard.messages) : []
  );

export const makeMessagesLoadingSelector = (chatId: string) =>
  createSelector(
    (state: RootState) => roomSelectors.selectById(state, chatId),
    (selectedBoard) =>
      selectedBoard
        ? !["succeeded", "failed"].includes(selectedBoard.messages.loading)
        : true
  );

export const makeMessagesLoadingStatusSelector = (chatId: string) =>
  createSelector(
    (state: RootState) => roomSelectors.selectById(state, chatId),
    (selectedBoard) =>
      selectedBoard ? selectedBoard.messages.loading : "uninitialized"
  );

export const makeMessagesErrorSelector = (chatId: string) =>
  createSelector(
    (state: RootState) => roomSelectors.selectById(state, chatId),
    (selectedBoard) => selectedBoard?.messages.error
  );
