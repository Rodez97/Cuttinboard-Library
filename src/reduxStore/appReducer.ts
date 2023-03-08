import { conversationsReducer } from "../conversations/conversations.slice";
import { cuttinboardReducer } from "../cuttinboard/cuttinboard.slice";
import { directMessagesReducer } from "../directMessages/directMessages.slice";
import { employeesReducer } from "../employee/employees.slice";
import { filesReducer } from "../files/files.slice";
import { messagesReducer } from "../messages/messages.slice";
import { notesReducer } from "../notes/notes.slice";
import { notificationsReducer } from "../notifications/notifications.slice";
import { utensilsReducer } from "../utensils/utensils.slice";
import { filesBoardSlice, notesBoardSlice } from "../boards/createBoardSlice";
import {
  globalFilesBoardSlice,
  globalNotesBoardSlice,
} from "../globalBoards/createGlobalBoardSlice";
import { dailyChecklists, locationChecklists } from "../checklistsGroups";
import { myShiftsReducer } from "../myShifts/myShifts.slice";
import { recurringTasksReducer } from "../recurringTasks/recurringTasks.slice";
import { combineReducers } from "@reduxjs/toolkit";
import { cuttinboardLocationReducer } from "../cuttinboardLocation";
import { scheduleReducer } from "../ScheduleRTDB";

export const appReducer = combineReducers({
  cuttinboardLocation: cuttinboardLocationReducer,
  directMessages: directMessagesReducer,
  messages: messagesReducer,
  notes: notesReducer,
  files: filesReducer,
  employees: employeesReducer,
  cuttinboard: cuttinboardReducer,
  notifications: notificationsReducer,
  utensils: utensilsReducer,
  schedule: scheduleReducer,
  conversations: conversationsReducer,
  recurringTasks: recurringTasksReducer,
  notesBoards: notesBoardSlice.reducer,
  filesBoards: filesBoardSlice.reducer,
  globalNotesBoards: globalNotesBoardSlice.reducer,
  globalFilesBoards: globalFilesBoardSlice.reducer,
  locationChecklists: locationChecklists.reducer,
  dailyChecklists: dailyChecklists.reducer,
  myShifts: myShiftsReducer,
});
