[@cuttinboard-solutions/cuttinboard-library](README.md) / Exports

# @cuttinboard-solutions/cuttinboard-library

## Table of contents

### Interfaces

- [DirectMessagesContext](interfaces/DirectMessagesContext.md)
- [FilesContextProps](interfaces/FilesContextProps.md)
- [FilesProviderProps](interfaces/FilesProviderProps.md)
- [IBoardContext](interfaces/IBoardContext.md)
- [IBoardProvider](interfaces/IBoardProvider.md)
- [IConversationsContextProps](interfaces/IConversationsContextProps.md)
- [ICuttinboardContext](interfaces/ICuttinboardContext.md)
- [ICuttinboardProvider](interfaces/ICuttinboardProvider.md)
- [IGBoardContext](interfaces/IGBoardContext.md)
- [IGBoardProvider](interfaces/IGBoardProvider.md)
- [ILocationContextProps](interfaces/ILocationContextProps.md)
- [ILocationProvider](interfaces/ILocationProvider.md)
- [IMessagesContext](interfaces/IMessagesContext.md)
- [IScheduleContext](interfaces/IScheduleContext.md)
- [MyShiftsContextProps](interfaces/MyShiftsContextProps.md)
- [MyShiftsProviderProps](interfaces/MyShiftsProviderProps.md)
- [NotesContextProps](interfaces/NotesContextProps.md)
- [NotesProviderProps](interfaces/NotesProviderProps.md)

### Type Aliases

- [ListReducerAction](modules.md#listreduceraction)
- [LoadingStatus](modules.md#loadingstatus)
- [MessageConstructorOptions](modules.md#messageconstructoroptions)
- [Permission](modules.md#permission)
- [SubmitMessageParams](modules.md#submitmessageparams)

### Variables

- [AUTH](modules.md#auth)
- [BoardContext](modules.md#boardcontext)
- [Colors](modules.md#colors)
- [ConversationsContext](modules.md#conversationscontext)
- [CuttinboardContext](modules.md#cuttinboardcontext)
- [DATABASE](modules.md#database)
- [DirectMessagesProviderContext](modules.md#directmessagesprovidercontext)
- [FIRESTORE](modules.md#firestore)
- [FUNCTIONS](modules.md#functions)
- [GBoardContext](modules.md#gboardcontext)
- [LocationContext](modules.md#locationcontext)
- [MessagesContext](modules.md#messagescontext)
- [MyShiftsContext](modules.md#myshiftscontext)
- [RecurringTasksContext](modules.md#recurringtaskscontext)
- [STORAGE](modules.md#storage)
- [ShiftContext](modules.md#shiftcontext)
- [boardConverter](modules.md#boardconverter)
- [checklistGroupConverter](modules.md#checklistgroupconverter)
- [conversationsConverter](modules.md#conversationsconverter)
- [cuttinboardFileConverter](modules.md#cuttinboardfileconverter)
- [cuttinboardUserConverter](modules.md#cuttinboarduserconverter)
- [dmConverter](modules.md#dmconverter)
- [employeeConverter](modules.md#employeeconverter)
- [employeesArrayDocumentConverter](modules.md#employeesarraydocumentconverter)
- [employeesDocumentConverter](modules.md#employeesdocumentconverter)
- [locationConverter](modules.md#locationconverter)
- [messagesConverter](modules.md#messagesconverter)
- [noteConverter](modules.md#noteconverter)
- [orgEmployeeConverter](modules.md#orgemployeeconverter)
- [recurringTaskDocConverter](modules.md#recurringtaskdocconverter)
- [scheduleConverter](modules.md#scheduleconverter)
- [shiftConverter](modules.md#shiftconverter)
- [utensilConverter](modules.md#utensilconverter)

### Functions

- [BoardProvider](modules.md#boardprovider)
- [ChecklistProvider](modules.md#checklistprovider)
- [ConversationsProvider](modules.md#conversationsprovider)
- [CuttinboardProvider](modules.md#cuttinboardprovider)
- [DirectMessagesProvider](modules.md#directmessagesprovider)
- [FilesProvider](modules.md#filesprovider)
- [GBoardProvider](modules.md#gboardprovider)
- [LocationProvider](modules.md#locationprovider)
- [MessagesProvider](modules.md#messagesprovider)
- [MyShiftsProvider](modules.md#myshiftsprovider)
- [NotesProvider](modules.md#notesprovider)
- [RecurringTasksProvider](modules.md#recurringtasksprovider)
- [ScheduleProvider](modules.md#scheduleprovider)
- [UtensilsProvider](modules.md#utensilsprovider)
- [addBoardHost](modules.md#addboardhost)
- [addChecklist](modules.md#addchecklist)
- [addChecklistTask](modules.md#addchecklisttask)
- [addPeriodicTask](modules.md#addperiodictask)
- [batchPublish](modules.md#batchpublish)
- [calculateShiftHourlyWage](modules.md#calculateshifthourlywage)
- [calculateWageData](modules.md#calculatewagedata)
- [calculateWageDataFromArray](modules.md#calculatewagedatafromarray)
- [changeTaskStatus](modules.md#changetaskstatus)
- [checkConversationMember](modules.md#checkconversationmember)
- [checkConversationMuted](modules.md#checkconversationmuted)
- [checkDirectMessageMuted](modules.md#checkdirectmessagemuted)
- [checkForOverlappingShifts](modules.md#checkforoverlappingshifts)
- [checkForOverlappingShiftsARRAY](modules.md#checkforoverlappingshiftsarray)
- [checkIfShiftsHaveChanges](modules.md#checkifshiftshavechanges)
- [checkShiftArrayChanges](modules.md#checkshiftarraychanges)
- [checkShiftObjectChanges](modules.md#checkshiftobjectchanges)
- [createDefaultScheduleDoc](modules.md#createdefaultscheduledoc)
- [createDirectMessageId](modules.md#createdirectmessageid)
- [createShiftElement](modules.md#createshiftelement)
- [generateOrderFactor](modules.md#generateorderfactor)
- [getAddMembersData](modules.md#getaddmembersdata)
- [getCancelShiftUpdateData](modules.md#getcancelshiftupdatedata)
- [getDeleteShiftData](modules.md#getdeleteshiftdata)
- [getDirectMessageOrderTime](modules.md#getdirectmessageordertime)
- [getDirectMessageRecipient](modules.md#getdirectmessagerecipient)
- [getEmployeeShifts](modules.md#getemployeeshifts)
- [getEmployeeShiftsSummary](modules.md#getemployeeshiftssummary)
- [getEmployeeShiftsWageData](modules.md#getemployeeshiftswagedata)
- [getEmployeesRef](modules.md#getemployeesref)
- [getFileUrl](modules.md#getfileurl)
- [getLocationStorageRef](modules.md#getlocationstorageref)
- [getNewShiftsDataBatch](modules.md#getnewshiftsdatabatch)
- [getNewUtensilChangeUpdates](modules.md#getnewutensilchangeupdates)
- [getOvertimeRateOfPay](modules.md#getovertimerateofpay)
- [getRemoveMemberData](modules.md#getremovememberdata)
- [getRenameData](modules.md#getrenamedata)
- [getRestoreShiftData](modules.md#getrestoreshiftdata)
- [getScheduleSummaryByDay](modules.md#getschedulesummarybyday)
- [getScheduleTotalProjectedSales](modules.md#getscheduletotalprojectedsales)
- [getScheduleWeekStart](modules.md#getscheduleweekstart)
- [getShiftAttribute](modules.md#getshiftattribute)
- [getShiftBaseData](modules.md#getshiftbasedata)
- [getShiftBaseWage](modules.md#getshiftbasewage)
- [getShiftDayjsDate](modules.md#getshiftdayjsdate)
- [getShiftDuration](modules.md#getshiftduration)
- [getShiftIsoWeekday](modules.md#getshiftisoweekday)
- [getShiftLatestData](modules.md#getshiftlatestdata)
- [getSingleEmpShifts](modules.md#getsingleempshifts)
- [getUpdateBoardData](modules.md#getupdateboarddata)
- [getUpdateShiftData](modules.md#getupdateshiftdata)
- [getUpdatesCount](modules.md#getupdatescount)
- [getUpdatesCountArray](modules.md#getupdatescountarray)
- [getUpdatesCountFromArray](modules.md#getupdatescountfromarray)
- [getWageData](modules.md#getwagedata)
- [getWageOptions](modules.md#getwageoptions)
- [getWeekDays](modules.md#getweekdays)
- [getWeekFullNumberByDate](modules.md#getweekfullnumberbydate)
- [getWeekSummary](modules.md#getweeksummary)
- [joinLocation](modules.md#joinlocation)
- [leaveLocation](modules.md#leavelocation)
- [listReducer](modules.md#listreducer)
- [minutesToTextDuration](modules.md#minutestotextduration)
- [ownOpenShift](modules.md#ownopenshift)
- [parseWeekId](modules.md#parseweekid)
- [removeBoardHost](modules.md#removeboardhost)
- [removeChecklist](modules.md#removechecklist)
- [removeChecklistTask](modules.md#removechecklisttask)
- [removeConversationMembers](modules.md#removeconversationmembers)
- [removePeriodicTask](modules.md#removeperiodictask)
- [reorderChecklistTask](modules.md#reorderchecklisttask)
- [reorderChecklists](modules.md#reorderchecklists)
- [resetAllTasks](modules.md#resetalltasks)
- [sendMessage](modules.md#sendmessage)
- [swapShifts](modules.md#swapshifts)
- [toggleCompleted](modules.md#togglecompleted)
- [toggleMuteConversation](modules.md#togglemuteconversation)
- [toggleMuteDM](modules.md#togglemutedm)
- [updateChecklist](modules.md#updatechecklist)
- [updatePeriodicTask](modules.md#updateperiodictask)
- [updateTask](modules.md#updatetask)
- [useAddEmployee](modules.md#useaddemployee)
- [useBoard](modules.md#useboard)
- [useBoardsData](modules.md#useboardsdata)
- [useChatPaths](modules.md#usechatpaths)
- [useChecklist](modules.md#usechecklist)
- [useConversations](modules.md#useconversations)
- [useConversationsData](modules.md#useconversationsdata)
- [useCuttinboard](modules.md#usecuttinboard)
- [useCuttinboardData](modules.md#usecuttinboarddata)
- [useCuttinboardLocation](modules.md#usecuttinboardlocation)
- [useCuttinboardLocationRaw](modules.md#usecuttinboardlocationraw)
- [useCuttinboardRaw](modules.md#usecuttinboardraw)
- [useDMData](modules.md#usedmdata)
- [useDeleteAccount](modules.md#usedeleteaccount)
- [useDirectMessageChat](modules.md#usedirectmessagechat)
- [useDisclose](modules.md#usedisclose)
- [useEmployees](modules.md#useemployees)
- [useFiles](modules.md#usefiles)
- [useFilesData](modules.md#usefilesdata)
- [useFindDMRecipient](modules.md#usefinddmrecipient)
- [useGBoard](modules.md#usegboard)
- [useGBoardsData](modules.md#usegboardsdata)
- [useLocationData](modules.md#uselocationdata)
- [useLocationPermissions](modules.md#uselocationpermissions)
- [useMessages](modules.md#usemessages)
- [useMyShifts](modules.md#usemyshifts)
- [useMyShiftsData](modules.md#usemyshiftsdata)
- [useNotes](modules.md#usenotes)
- [useNotesData](modules.md#usenotesdata)
- [useNotifications](modules.md#usenotifications)
- [useRecurringTasks](modules.md#userecurringtasks)
- [useRegister](modules.md#useregister)
- [useSchedule](modules.md#useschedule)
- [useScheduleData](modules.md#usescheduledata)
- [useUpdateAccount](modules.md#useupdateaccount)
- [useUtensils](modules.md#useutensils)
- [weekToDate](modules.md#weektodate)

## Type Aliases

### ListReducerAction

Ƭ **ListReducerAction**<`T`\>: { `payload`: `string` ; `type`: ``"DELETE_BY_ID"``  } \| { `payload`: `T` ; `type`: ``"SET_ELEMENT"``  } \| { `payload`: { `data`: `Partial`<`T`\> ; `elementId`: `string`  } ; `type`: ``"UPDATE_ELEMENT"``  } \| { `payload`: `T`[] ; `type`: ``"ADD_ELEMENTS"``  } \| { `type`: ``"CLEAR"``  } \| { `payload`: `T` ; `type`: ``"ADD_ELEMENT"``  } \| { `payload`: `T`[] ; `type`: ``"SET_ELEMENTS"``  } \| { `payload`: `T`[] ; `type`: ``"UPSERT_ELEMENTS"``  } \| { `payload`: `T`[] ; `type`: ``"REMOVE_ELEMENTS"``  }

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[src/utils/listReducer.ts:1](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utils/listReducer.ts#L1)

___

### LoadingStatus

Ƭ **LoadingStatus**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `error?` | `string` |
| `loading` | ``"idle"`` \| ``"succeeded"`` \| ``"failed"`` \| ``"pending"`` |

#### Defined in

[src/models/LoadingStatus.ts:1](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/models/LoadingStatus.ts#L1)

___

### MessageConstructorOptions

Ƭ **MessageConstructorOptions**: { `isDM?`: ``false`` ; `uploadAttachment?`: (`messageId`: `string`) => `Promise`<`string`\>  } \| { `dmId`: `string` ; `isDM`: ``true`` ; `uploadAttachment?`: (`messageId`: `string`) => `Promise`<`string`\>  }

#### Defined in

[src/messages/types.ts:8](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/messages/types.ts#L8)

___

### Permission

Ƭ **Permission**: ``"manageLocationPositions"`` \| ``"manageStaff"`` \| ``"manageStaffDocuments"`` \| ``"manageSchedule"`` \| ``"manageScheduleSettings"`` \| ``"seeWages"`` \| ``"seeOthersManagersWages"`` \| ``"manageUtensils"`` \| ``"reportUtensilChanges"`` \| ``"manageBoard"`` \| ``"manageBoardContent"`` \| ``"manageBoardMembers"`` \| ``"manageMessageBoard"`` \| ``"manageTasks"`` \| ``"manageRecurringTasks"`` \| ``"manageDailyTasks"``

#### Defined in

[src/employee/usePermissions.tsx:58](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/employee/usePermissions.tsx#L58)

___

### SubmitMessageParams

Ƭ **SubmitMessageParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `messageText` | `string` |
| `uploadAttachment?` | { `image`: `string` ; `uploadFn`: (`messageId`: `string`) => `Promise`<`string`\>  } |
| `uploadAttachment.image` | `string` |
| `uploadAttachment.uploadFn` | (`messageId`: `string`) => `Promise`<`string`\> |

#### Defined in

[src/messages/types.ts:19](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/messages/types.ts#L19)

## Variables

### AUTH

• `Const` **AUTH**: `Auth`

#### Defined in

[src/utils/firebase.ts:15](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utils/firebase.ts#L15)

___

### BoardContext

• `Const` **BoardContext**: `Context`<[`IBoardContext`](interfaces/IBoardContext.md)\>

The Board Provider Context that is used to select a board and create new boards.

#### Defined in

[src/boards/BoardProvider.tsx:57](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/BoardProvider.tsx#L57)

___

### Colors

• `Const` **Colors**: `Object`

Basic colors used in the app and their hex values.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Blue` | { `Light`: `string` = "#F3F8FF"; `Main`: `string` = "#94BDEA" } |
| `Blue.Light` | `string` |
| `Blue.Main` | `string` |
| `CalculateContrast` | (`hex`: `string`) => ``"#ffffff"`` \| ``"#000000"`` |
| `Error` | { `errorDark`: `string` = "#c62828"; `errorLight`: `string` = "#ef9a9a"; `errorMain`: `string` = "#f44336" } |
| `Error.errorDark` | `string` |
| `Error.errorLight` | `string` |
| `Error.errorMain` | `string` |
| `Green` | { `Light`: `string` = "#E3F5F0"; `Main`: `string` = "#68AEA0" } |
| `Green.Light` | `string` |
| `Green.Main` | `string` |
| `Grey` | { `grey100`: `string` = "#f5f5f5"; `grey200`: `string` = "#eeeeee"; `grey300`: `string` = "#e0e0e0"; `grey50`: `string` = "#fafafa"; `grey500`: `string` = "#9e9e9e"; `grey600`: `string` = "#757575"; `grey700`: `string` = "#616161"; `grey900`: `string` = "#212121" } |
| `Grey.grey100` | `string` |
| `Grey.grey200` | `string` |
| `Grey.grey300` | `string` |
| `Grey.grey50` | `string` |
| `Grey.grey500` | `string` |
| `Grey.grey600` | `string` |
| `Grey.grey700` | `string` |
| `Grey.grey900` | `string` |
| `MainBlack` | `string` |
| `MainBlue` | `string` |
| `MainDark` | `string` |
| `MainOnDark` | `string` |
| `MainOnWhite` | `string` |
| `Notes` | `string` |
| `Orange` | { `orangeDark`: `string` = "#d84315"; `orangeLight`: `string` = "#fbe9e7"; `orangeMain`: `string` = "#ffab91" } |
| `Orange.orangeDark` | `string` |
| `Orange.orangeLight` | `string` |
| `Orange.orangeMain` | `string` |
| `Primary` | { `primary200`: `string` = "#90caf9"; `primary800`: `string` = "#1565c0"; `primaryDark`: `string` = "#1e88e5"; `primaryLight`: `string` = "#e3f2fd"; `primaryMain`: `string` = "#2196f3" } |
| `Primary.primary200` | `string` |
| `Primary.primary800` | `string` |
| `Primary.primaryDark` | `string` |
| `Primary.primaryLight` | `string` |
| `Primary.primaryMain` | `string` |
| `Secondary` | { `secondary200`: `string` = "#b39ddb"; `secondary800`: `string` = "#4527a0"; `secondaryDark`: `string` = "#5e35b1"; `secondaryLight`: `string` = "#ede7f6"; `secondaryMain`: `string` = "#673ab7" } |
| `Secondary.secondary200` | `string` |
| `Secondary.secondary800` | `string` |
| `Secondary.secondaryDark` | `string` |
| `Secondary.secondaryLight` | `string` |
| `Secondary.secondaryMain` | `string` |
| `SecondaryBlack` | `string` |
| `SecondaryOnDark` | `string` |
| `SecondaryOnWhite` | `string` |
| `Success` | { `success200`: `string` = "#69f0ae"; `successDark`: `string` = "#00c853"; `successLight`: `string` = "#b9f6ca"; `successMain`: `string` = "#00e676" } |
| `Success.success200` | `string` |
| `Success.successDark` | `string` |
| `Success.successLight` | `string` |
| `Success.successMain` | `string` |
| `Warning` | { `warningDark`: `string` = "#ffc107"; `warningLight`: `string` = "#fff8e1"; `warningMain`: `string` = "#ffe57f" } |
| `Warning.warningDark` | `string` |
| `Warning.warningLight` | `string` |
| `Warning.warningMain` | `string` |
| `Yellow` | { `Light`: `string` = "#FDFCED"; `Main`: `string` = "#EBD964" } |
| `Yellow.Light` | `string` |
| `Yellow.Main` | `string` |
| `paper` | `string` |

#### Defined in

[src/utils/Colors.ts:4](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utils/Colors.ts#L4)

___

### ConversationsContext

• `Const` **ConversationsContext**: `Context`<[`IConversationsContextProps`](interfaces/IConversationsContextProps.md)\>

#### Defined in

[src/conversations/ConversationsProvider.tsx:94](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/ConversationsProvider.tsx#L94)

___

### CuttinboardContext

• `Const` **CuttinboardContext**: `Context`<[`ICuttinboardContext`](interfaces/ICuttinboardContext.md)\>

#### Defined in

[src/cuttinboard/CuttinboardProvider.tsx:24](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboard/CuttinboardProvider.tsx#L24)

___

### DATABASE

• `Const` **DATABASE**: `Database`

#### Defined in

[src/utils/firebase.ts:30](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utils/firebase.ts#L30)

___

### DirectMessagesProviderContext

• `Const` **DirectMessagesProviderContext**: `Context`<[`DirectMessagesContext`](interfaces/DirectMessagesContext.md)\>

The context used by the DirectMessage component.

#### Defined in

[src/directMessages/DirectMessagesProvider.tsx:48](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/DirectMessagesProvider.tsx#L48)

___

### FIRESTORE

• `Const` **FIRESTORE**: `Firestore`

#### Defined in

[src/utils/firebase.ts:10](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utils/firebase.ts#L10)

___

### FUNCTIONS

• `Const` **FUNCTIONS**: `Functions`

#### Defined in

[src/utils/firebase.ts:25](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utils/firebase.ts#L25)

___

### GBoardContext

• `Const` **GBoardContext**: `Context`<[`IGBoardContext`](interfaces/IGBoardContext.md)\>

The Board Provider Context that is used to select a board and create new boards.

#### Defined in

[src/globalBoards/GBoardProvider.tsx:46](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/globalBoards/GBoardProvider.tsx#L46)

___

### LocationContext

• `Const` **LocationContext**: `Context`<[`ILocationContextProps`](interfaces/ILocationContextProps.md)\>

#### Defined in

[src/cuttinboardLocation/LocationProvider.tsx:38](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/LocationProvider.tsx#L38)

___

### MessagesContext

• `Const` **MessagesContext**: `Context`<[`IMessagesContext`](interfaces/IMessagesContext.md)\>

#### Defined in

[src/messages/MessagesProvider.tsx:41](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/messages/MessagesProvider.tsx#L41)

___

### MyShiftsContext

• `Const` **MyShiftsContext**: `Context`<[`MyShiftsContextProps`](interfaces/MyShiftsContextProps.md)\>

#### Defined in

[src/myShifts/MyShiftsProvider.tsx:20](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/myShifts/MyShiftsProvider.tsx#L20)

___

### RecurringTasksContext

• `Const` **RecurringTasksContext**: `Context`<`RecurringTasksContextProps`\>

#### Defined in

[src/recurringTasks/RecurringTasksProvider.tsx:39](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/recurringTasks/RecurringTasksProvider.tsx#L39)

___

### STORAGE

• `Const` **STORAGE**: `FirebaseStorage`

#### Defined in

[src/utils/firebase.ts:20](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utils/firebase.ts#L20)

___

### ShiftContext

• `Const` **ShiftContext**: `Context`<[`IScheduleContext`](interfaces/IScheduleContext.md)\>

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:128](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L128)

___

### boardConverter

• `Const` **boardConverter**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<`IBoard`\>, `options`: `SnapshotOptions`) => `IBoard` |
| `toFirestore` | (`object`: `IBoard`) => `DocumentData` |

#### Defined in

[src/boards/boardHelpers.ts:16](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/boardHelpers.ts#L16)

___

### checklistGroupConverter

• `Const` **checklistGroupConverter**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<`IChecklistGroup`\>, `options`: `SnapshotOptions`) => `IChecklistGroup` |
| `toFirestore` | (`object`: `IChecklistGroup`) => `DocumentData` |

#### Defined in

[src/checklistsGroups/checklistGroupUtils.ts:22](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/checklistGroupUtils.ts#L22)

___

### conversationsConverter

• `Const` **conversationsConverter**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<`IConversation`\>, `options`: `SnapshotOptions`) => `IConversation` |
| `toFirestore` | (`object`: `IConversation`) => `DocumentData` |

#### Defined in

[src/conversations/conversationUtils.ts:11](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/conversationUtils.ts#L11)

___

### cuttinboardFileConverter

• `Const` **cuttinboardFileConverter**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<`ICuttinboard_File`\>, `options`: `SnapshotOptions`) => `ICuttinboard_File` |
| `toFirestore` | (`object`: `ICuttinboard_File`) => `DocumentData` |

#### Defined in

[src/files/Cuttinboard_File.ts:10](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/files/Cuttinboard_File.ts#L10)

___

### cuttinboardUserConverter

• `Const` **cuttinboardUserConverter**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<`ICuttinboardUser`\>, `options`: `SnapshotOptions`) => `ICuttinboardUser` |
| `toFirestore` | (`object`: `ICuttinboardUser`) => `DocumentData` |

#### Defined in

[src/account/accountUtils.ts:8](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/account/accountUtils.ts#L8)

___

### dmConverter

• `Const` **dmConverter**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<`IDirectMessage`\>, `options`: `SnapshotOptions`) => `IDirectMessage` |
| `toFirestore` | (`object`: `IDirectMessage`) => `DocumentData` |

#### Defined in

[src/directMessages/dmUtils.ts:15](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/dmUtils.ts#L15)

___

### employeeConverter

• `Const` **employeeConverter**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<`IEmployee`\>, `options`: `SnapshotOptions`) => `IEmployee` |
| `toFirestore` | (`object`: `IEmployee`) => `DocumentData` |

#### Defined in

[src/employee/Employee.ts:43](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/employee/Employee.ts#L43)

___

### employeesArrayDocumentConverter

• `Const` **employeesArrayDocumentConverter**: `FirestoreDataConverter`<`IEmployeesDocument` \| `IEmployee`[]\>

#### Defined in

[src/employee/Employee.ts:27](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/employee/Employee.ts#L27)

___

### employeesDocumentConverter

• `Const` **employeesDocumentConverter**: `FirestoreDataConverter`<`IEmployeesDocument`\>

#### Defined in

[src/employee/Employee.ts:13](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/employee/Employee.ts#L13)

___

### locationConverter

• `Const` **locationConverter**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<`ILocation`\>, `options`: `SnapshotOptions`) => `ILocation` |
| `toFirestore` | (`object`: `ILocation`) => `DocumentData` |

#### Defined in

[src/cuttinboardLocation/Location.ts:18](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/Location.ts#L18)

___

### messagesConverter

• `Const` **messagesConverter**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<`IMessage`\>, `options`: `SnapshotOptions`) => `IMessage` |
| `toFirestore` | (`object`: `IMessage`) => `DocumentData` |

#### Defined in

[src/messages/types.ts:29](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/messages/types.ts#L29)

___

### noteConverter

• `Const` **noteConverter**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<`INote`\>, `options`: `SnapshotOptions`) => `INote` |
| `toFirestore` | (`object`: `INote`) => `DocumentData` |

#### Defined in

[src/notes/Note.ts:8](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/notes/Note.ts#L8)

___

### orgEmployeeConverter

• `Const` **orgEmployeeConverter**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<`IOrganizationEmployee`\>, `options`: `SnapshotOptions`) => `IOrganizationEmployee` |
| `toFirestore` | (`object`: `IOrganizationEmployee`) => `DocumentData` |

#### Defined in

[src/employee/Employee.ts:62](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/employee/Employee.ts#L62)

___

### recurringTaskDocConverter

• `Const` **recurringTaskDocConverter**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<`IRecurringTaskDoc`\>, `options`: `SnapshotOptions`) => `IRecurringTaskDoc` |
| `toFirestore` | (`object`: `IRecurringTaskDoc`) => `DocumentData` |

#### Defined in

[src/recurringTasks/RecurringTask.ts:19](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/recurringTasks/RecurringTask.ts#L19)

___

### scheduleConverter

• `Const` **scheduleConverter**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<`IScheduleDoc`\>, `options`: `SnapshotOptions`) => `IScheduleDoc` |
| `toFirestore` | (`object`: `PartialWithFieldValue`<`IScheduleDoc`\>) => `DocumentData` |

#### Defined in

[src/ScheduleRTDB/ScheduleHelpers.ts:15](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleHelpers.ts#L15)

___

### shiftConverter

• `Const` **shiftConverter**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<`IShift`\>, `options`: `SnapshotOptions`) => `IShift` |
| `toFirestore` | (`object`: `PartialWithFieldValue`<`IShift`\>) => `DocumentData` |

#### Defined in

[src/ScheduleRTDB/Shift.ts:25](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/Shift.ts#L25)

___

### utensilConverter

• `Const` **utensilConverter**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<`IUtensil`\>, `options`: `SnapshotOptions`) => `IUtensil` |
| `toFirestore` | (`object`: `IUtensil`) => `DocumentData` |

#### Defined in

[src/utensils/Utensil.ts:16](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utensils/Utensil.ts#L16)

## Functions

### BoardProvider

▸ **BoardProvider**(`props`): `Element`

The Board Provider

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `props` | [`IBoardProvider`](interfaces/IBoardProvider.md) | The props for the board provider component. |

#### Returns

`Element`

A React Component that provides the board context.

#### Defined in

[src/boards/BoardProvider.tsx:66](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/BoardProvider.tsx#L66)

___

### ChecklistProvider

▸ **ChecklistProvider**(`«destructured»`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `ChecklistProviderProps` |

#### Returns

`Element`

#### Defined in

[src/checklistsGroups/ChecklistProvider.tsx:100](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/ChecklistProvider.tsx#L100)

___

### ConversationsProvider

▸ **ConversationsProvider**(`«destructured»`): `Element`

The `ConversationsProvider` is a React component that provides context for conversations and conversation management.
It uses the `useCuttinboard` hook to get information about the current user, the `useEmployeesList` hook to get a list of employees at the current location,
and the `useLocation` hook to get information about the current location.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `ConversationsProviderProps` |

#### Returns

`Element`

#### Defined in

[src/conversations/ConversationsProvider.tsx:117](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/ConversationsProvider.tsx#L117)

___

### CuttinboardProvider

▸ **CuttinboardProvider**(`«destructured»`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`ICuttinboardProvider`](interfaces/ICuttinboardProvider.md) |

#### Returns

`Element`

#### Defined in

[src/cuttinboard/CuttinboardProvider.tsx:46](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboard/CuttinboardProvider.tsx#L46)

___

### DirectMessagesProvider

▸ **DirectMessagesProvider**(`«destructured»`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `DirectMessagesProviderProps` |

#### Returns

`Element`

#### Defined in

[src/directMessages/DirectMessagesProvider.tsx:55](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/DirectMessagesProvider.tsx#L55)

___

### FilesProvider

▸ **FilesProvider**(`«destructured»`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`FilesProviderProps`](interfaces/FilesProviderProps.md) |

#### Returns

`Element`

#### Defined in

[src/files/FilesProvider.tsx:31](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/files/FilesProvider.tsx#L31)

___

### GBoardProvider

▸ **GBoardProvider**(`props`): `Element`

The Board Provider

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `props` | [`IGBoardProvider`](interfaces/IGBoardProvider.md) | The props for the board provider component. |

#### Returns

`Element`

A React Component that provides the board context.

#### Defined in

[src/globalBoards/GBoardProvider.tsx:55](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/globalBoards/GBoardProvider.tsx#L55)

___

### LocationProvider

▸ **LocationProvider**(`«destructured»`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`ILocationProvider`](interfaces/ILocationProvider.md) |

#### Returns

`Element`

#### Defined in

[src/cuttinboardLocation/LocationProvider.tsx:49](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/LocationProvider.tsx#L49)

___

### MessagesProvider

▸ **MessagesProvider**(`«destructured»`): `Element`

A component that provides the Direct Messages context.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | - |
| › `batchSize` | `number` | - |
| › `children` | `ReactNode` | The children of the component. |
| › `initialLoadSize` | `number` | - |
| › `messagingType` | `MessageProviderMessagingType` | The type of the chat that the context is for. |

#### Returns

`Element`

#### Defined in

[src/messages/MessagesProvider.tsx:48](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/messages/MessagesProvider.tsx#L48)

___

### MyShiftsProvider

▸ **MyShiftsProvider**(`«destructured»`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`MyShiftsProviderProps`](interfaces/MyShiftsProviderProps.md) |

#### Returns

`Element`

#### Defined in

[src/myShifts/MyShiftsProvider.tsx:24](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/myShifts/MyShiftsProvider.tsx#L24)

___

### NotesProvider

▸ **NotesProvider**(`«destructured»`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`NotesProviderProps`](interfaces/NotesProviderProps.md) |

#### Returns

`Element`

#### Defined in

[src/notes/NotesProvider.tsx:28](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/notes/NotesProvider.tsx#L28)

___

### RecurringTasksProvider

▸ **RecurringTasksProvider**(`«destructured»`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `RecurringTasksProviderProps` |

#### Returns

`Element`

#### Defined in

[src/recurringTasks/RecurringTasksProvider.tsx:43](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/recurringTasks/RecurringTasksProvider.tsx#L43)

___

### ScheduleProvider

▸ **ScheduleProvider**(`«destructured»`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `IScheduleProvider` |

#### Returns

`Element`

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:132](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L132)

___

### UtensilsProvider

▸ **UtensilsProvider**(`«destructured»`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `IUtensilsProvider` |

#### Returns

`Element`

#### Defined in

[src/utensils/UtensilsProvider.tsx:56](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utensils/UtensilsProvider.tsx#L56)

___

### addBoardHost

▸ **addBoardHost**(`newHost`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `newHost` | `IEmployee` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `createdAt?` | `number` \| `FieldValue` |
| `description?` | `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `string`\> |
| `details?` | `FieldValue` \| `PartialWithFieldValue`<{ `admins?`: `string`[] ; `members?`: `string`[] ; `parentId`: `string` ; `position?`: `string` ; `privacyLevel`: `PrivacyLevel`  }\> |
| `global?` | `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `boolean`\> |
| `id?` | `string` \| `FieldValue` |
| `name?` | `string` \| `FieldValue` |
| `refPath?` | `string` \| `FieldValue` |
| `updatedAt?` | `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `number`\> |

#### Defined in

[src/boards/boardHelpers.ts:47](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/boardHelpers.ts#L47)

___

### addChecklist

▸ **addChecklist**(`checklistObject`, `newChecklistKey`, `newTask?`): `Partial`<`IChecklistGroup`\>

This function adds a new checklist section with optional tasks to a checklist object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `checklistObject` | `IChecklistGroup` | An object of type IChecklistGroup which represents a group of checklists. |
| `newChecklistKey` | `string` | A string representing the unique identifier for the new checklist section being added. |
| `newTask?` | `Object` | The optional parameter `newTask` is an object that represents a new task to be added to the checklist. It has three properties: `id` (string), `name` (string), and `status` (boolean). If `newTask` is not provided, an empty object will be |
| `newTask.id` | `string` | - |
| `newTask.name` | `string` | - |

#### Returns

`Partial`<`IChecklistGroup`\>

An object with two properties: `serverUpdates` and `localUpdates`.

#### Defined in

[src/checklistsGroups/checklistGroupUtils.ts:126](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/checklistGroupUtils.ts#L126)

___

### addChecklistTask

▸ **addChecklistTask**(`baseObject`, `checklistId`, `taskKey`, `name`): `Object`

Add a new task to a checklist.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `baseObject` | `IChecklistGroup` | - |
| `checklistId` | `string` | - |
| `taskKey` | `string` | The key of the task to add. |
| `name` | `string` | The task to add. |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `checklists` | {} |

#### Defined in

[src/tasks/tasksUtils.ts:53](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/tasks/tasksUtils.ts#L53)

___

### addPeriodicTask

▸ **addPeriodicTask**(`task`, `id`): `Object`

The function adds a recurring task to a server update object and returns it.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `task` | `IRecurringTask` | The task parameter is an object that represents a recurring task. It likely contains properties such as the task's name, description, frequency, and any other relevant information needed to execute the task on a recurring basis. |
| `id` | `string` | id is a string parameter that represents the unique identifier of the recurring task being added. It is used as a key in the tasks object to store the task details. |

#### Returns

`Object`

The function `addPeriodicTask` returns an object `serverUpdates` with a property `tasks`
that contains an object with a key-value pair where the key is the `id` parameter and the value is
the `task` parameter.

| Name | Type |
| :------ | :------ |
| `tasks` | {} |

#### Defined in

[src/recurringTasks/RecurringTask.ts:49](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/recurringTasks/RecurringTask.ts#L49)

___

### batchPublish

▸ **batchPublish**(`employeeShifts`): `undefined` \| `WriteBatch`

#### Parameters

| Name | Type |
| :------ | :------ |
| `employeeShifts` | `undefined` \| `IShift`[] |

#### Returns

`undefined` \| `WriteBatch`

#### Defined in

[src/ScheduleRTDB/EmployeeShifts.ts:22](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/EmployeeShifts.ts#L22)

___

### calculateShiftHourlyWage

▸ **calculateShiftHourlyWage**(`shift`, `accumulatedHours`, `hoursLimit`, `overtimeRateOfPay`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |
| `accumulatedHours` | `number` |
| `hoursLimit` | `number` |
| `overtimeRateOfPay` | `number` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `normalHours` | `number` |
| `normalWage` | `number` |
| `overtimeHours` | `number` |
| `overtimeWage` | `number` |
| `totalHours` | `number` |
| `totalWage` | `number` |

#### Defined in

[src/ScheduleRTDB/Shift.ts:201](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/Shift.ts#L201)

___

### calculateWageData

▸ **calculateWageData**(`empShifts`, `options?`): `WageDataRecord`

#### Parameters

| Name | Type |
| :------ | :------ |
| `empShifts` | `undefined` \| `IShift`[] |
| `options?` | `WageOptions` |

#### Returns

`WageDataRecord`

#### Defined in

[src/ScheduleRTDB/Shift.ts:274](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/Shift.ts#L274)

___

### calculateWageDataFromArray

▸ **calculateWageDataFromArray**(`empShifts`, `options?`): `WageDataRecord`

#### Parameters

| Name | Type |
| :------ | :------ |
| `empShifts` | `undefined` \| `IShift`[] |
| `options?` | `WageOptions` |

#### Returns

`WageDataRecord`

#### Defined in

[src/ScheduleRTDB/Shift.ts:387](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/Shift.ts#L387)

___

### changeTaskStatus

▸ **changeTaskStatus**(`checklistId`, `taskKey`, `newStatus`): `Object`

Update the status of a task.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `checklistId` | `string` | - |
| `taskKey` | `string` | - |
| `newStatus` | `boolean` | The new status of the task. |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `checklists` | {} |

#### Defined in

[src/tasks/tasksUtils.ts:28](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/tasks/tasksUtils.ts#L28)

___

### checkConversationMember

▸ **checkConversationMember**(`conversation`): `boolean`

Check if the current user is a direct member of this conversation.

#### Parameters

| Name | Type |
| :------ | :------ |
| `conversation` | `IConversation` |

#### Returns

`boolean`

#### Defined in

[src/conversations/conversationUtils.ts:36](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/conversationUtils.ts#L36)

___

### checkConversationMuted

▸ **checkConversationMuted**(`conversation`): `boolean`

Check if the current user has muted this chat.

#### Parameters

| Name | Type |
| :------ | :------ |
| `conversation` | `IConversation` |

#### Returns

`boolean`

#### Defined in

[src/conversations/conversationUtils.ts:26](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/conversationUtils.ts#L26)

___

### checkDirectMessageMuted

▸ **checkDirectMessageMuted**(`directMessages`, `uid`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `directMessages` | `IDirectMessage` |
| `uid` | `string` |

#### Returns

`boolean`

#### Defined in

[src/directMessages/dmUtils.ts:42](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/dmUtils.ts#L42)

___

### checkForOverlappingShifts

▸ **checkForOverlappingShifts**(`weekEmployeeShifts`, `start`, `end`, `shiftId`): `boolean`

Check if a new shift start or end time overlaps with an existing shift

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `weekEmployeeShifts` | `undefined` \| `IShift`[] | - |
| `start` | `Dayjs` | The start time of the new shift |
| `end` | `Dayjs` | The end time of the new shift |
| `shiftId` | `string` | The id of the shift to ignore |

#### Returns

`boolean`

#### Defined in

[src/ScheduleRTDB/ShiftData.ts:85](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ShiftData.ts#L85)

___

### checkForOverlappingShiftsARRAY

▸ **checkForOverlappingShiftsARRAY**(`shifts`, `start`, `end`, `shiftId`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `shifts` | `IShift`[] |
| `start` | `Dayjs` |
| `end` | `Dayjs` |
| `shiftId` | `string` |

#### Returns

`boolean`

#### Defined in

[src/ScheduleRTDB/ShiftData.ts:118](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ShiftData.ts#L118)

___

### checkIfShiftsHaveChanges

▸ **checkIfShiftsHaveChanges**(`shift`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |

#### Returns

`boolean`

#### Defined in

[src/ScheduleRTDB/Shift.ts:268](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/Shift.ts#L268)

___

### checkShiftArrayChanges

▸ **checkShiftArrayChanges**(`shifts`): `boolean`

Check is the employee's schedule have any changes or is unpublished

#### Parameters

| Name | Type |
| :------ | :------ |
| `shifts` | `IShift`[] |

#### Returns

`boolean`

#### Defined in

[src/ScheduleRTDB/ShiftData.ts:69](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ShiftData.ts#L69)

___

### checkShiftObjectChanges

▸ **checkShiftObjectChanges**(`weekEmployeeShifts`): `boolean`

Check is the employee's schedule have any changes or is unpublished

#### Parameters

| Name | Type |
| :------ | :------ |
| `weekEmployeeShifts` | `undefined` \| `IShift`[] |

#### Returns

`boolean`

#### Defined in

[src/ScheduleRTDB/ShiftData.ts:51](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ShiftData.ts#L51)

___

### createDefaultScheduleDoc

▸ **createDefaultScheduleDoc**(`weekId`, `locationId`): `IScheduleDoc`

#### Parameters

| Name | Type |
| :------ | :------ |
| `weekId` | `string` |
| `locationId` | `string` |

#### Returns

`IScheduleDoc`

#### Defined in

[src/ScheduleRTDB/ScheduleHelpers.ts:69](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleHelpers.ts#L69)

___

### createDirectMessageId

▸ **createDirectMessageId**(`userId`, `recipientId`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `userId` | `string` |
| `recipientId` | `string` |

#### Returns

`string`

#### Defined in

[src/directMessages/dmUtils.ts:68](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/dmUtils.ts#L68)

___

### createShiftElement

▸ **createShiftElement**(`shift`, `dates`, `applyToWeekDays`): `IShift`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |
| `dates` | `Dayjs`[] |
| `applyToWeekDays` | `number`[] |

#### Returns

`IShift`[]

#### Defined in

[src/ScheduleRTDB/helpers.ts:10](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/helpers.ts#L10)

___

### generateOrderFactor

▸ **generateOrderFactor**(`weekId`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `weekId` | `string` |

#### Returns

`number`

#### Defined in

[src/ScheduleRTDB/Shift.ts:42](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/Shift.ts#L42)

___

### getAddMembersData

▸ **getAddMembersData**(`board`, `addedEmployees`): `undefined` \| { `createdAt?`: `number` \| `FieldValue` ; `description?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `string`\> ; `details?`: `FieldValue` \| `PartialWithFieldValue`<{ `admins?`: `string`[] ; `members?`: `string`[] ; `parentId`: `string` ; `position?`: `string` ; `privacyLevel`: `PrivacyLevel`  }\> ; `global?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `boolean`\> ; `id?`: `string` \| `FieldValue` ; `name?`: `string` \| `FieldValue` ; `refPath?`: `string` \| `FieldValue` ; `updatedAt?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `number`\>  }

Add new members to the board.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `board` | `IBoard` | - |
| `addedEmployees` | `IEmployee`[] | The employees to add. |

#### Returns

`undefined` \| { `createdAt?`: `number` \| `FieldValue` ; `description?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `string`\> ; `details?`: `FieldValue` \| `PartialWithFieldValue`<{ `admins?`: `string`[] ; `members?`: `string`[] ; `parentId`: `string` ; `position?`: `string` ; `privacyLevel`: `PrivacyLevel`  }\> ; `global?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `boolean`\> ; `id?`: `string` \| `FieldValue` ; `name?`: `string` \| `FieldValue` ; `refPath?`: `string` \| `FieldValue` ; `updatedAt?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `number`\>  }

#### Defined in

[src/boards/boardHelpers.ts:75](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/boardHelpers.ts#L75)

___

### getCancelShiftUpdateData

▸ **getCancelShiftUpdateData**(`shift`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/ScheduleRTDB/EmployeeShifts.ts:74](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/EmployeeShifts.ts#L74)

___

### getDeleteShiftData

▸ **getDeleteShiftData**(`shift`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/ScheduleRTDB/EmployeeShifts.ts:87](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/EmployeeShifts.ts#L87)

___

### getDirectMessageOrderTime

▸ **getDirectMessageOrderTime**(`directMessages`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `directMessages` | `IDirectMessage` |

#### Returns

`number`

#### Defined in

[src/directMessages/dmUtils.ts:71](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/dmUtils.ts#L71)

___

### getDirectMessageRecipient

▸ **getDirectMessageRecipient**(`directMessages`, `uid`): `Sender`

#### Parameters

| Name | Type |
| :------ | :------ |
| `directMessages` | `IDirectMessage` |
| `uid` | `string` |

#### Returns

`Sender`

#### Defined in

[src/directMessages/dmUtils.ts:52](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/dmUtils.ts#L52)

___

### getEmployeeShifts

▸ **getEmployeeShifts**(`employees`, `shifts`): { `employee`: `IEmployee` = emp; `key`: `string` = emp.id; `shifts`: `IShift`[]  }[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `employees` | `IEmployee`[] |
| `shifts` | `IShift`[] |

#### Returns

{ `employee`: `IEmployee` = emp; `key`: `string` = emp.id; `shifts`: `IShift`[]  }[]

#### Defined in

[src/ScheduleRTDB/scheduleSelectors.ts:12](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/scheduleSelectors.ts#L12)

___

### getEmployeeShiftsSummary

▸ **getEmployeeShiftsSummary**(`data`): `WageDataByDay`[`number`]

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `undefined` \| ``null`` \| `WageDataByDay` |

#### Returns

`WageDataByDay`[`number`]

#### Defined in

[src/ScheduleRTDB/ShiftData.ts:151](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ShiftData.ts#L151)

___

### getEmployeeShiftsWageData

▸ **getEmployeeShiftsWageData**(`employeeShifts`, `scheduleSettings?`): `Record`<`string`, `WageDataRecord`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `employeeShifts` | `undefined` \| `IShift`[] |
| `scheduleSettings?` | `IScheduleSettings` |

#### Returns

`Record`<`string`, `WageDataRecord`\>

#### Defined in

[src/ScheduleRTDB/scheduleMathHelpers.ts:131](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/scheduleMathHelpers.ts#L131)

___

### getEmployeesRef

▸ **getEmployeesRef**(`location`): `DocumentReference`<`IEmployeesDocument`\>

Gets the employees reference for the location in firestore.

#### Parameters

| Name | Type |
| :------ | :------ |
| `location` | `ILocation` |

#### Returns

`DocumentReference`<`IEmployeesDocument`\>

#### Defined in

[src/cuttinboardLocation/Location.ts:47](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/Location.ts#L47)

___

### getFileUrl

▸ **getFileUrl**(`file`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `file` | `ICuttinboard_File` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/files/Cuttinboard_File.ts:29](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/files/Cuttinboard_File.ts#L29)

___

### getLocationStorageRef

▸ **getLocationStorageRef**(`location`): `StorageReference`

Gets the cloud storage reference for the location.

#### Parameters

| Name | Type |
| :------ | :------ |
| `location` | `ILocation` |

#### Returns

`StorageReference`

#### Defined in

[src/cuttinboardLocation/Location.ts:40](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/Location.ts#L40)

___

### getNewShiftsDataBatch

▸ **getNewShiftsDataBatch**(`newShifts`): `WriteBatch`

#### Parameters

| Name | Type |
| :------ | :------ |
| `newShifts` | `IShift`[] |

#### Returns

`WriteBatch`

#### Defined in

[src/ScheduleRTDB/EmployeeShifts.ts:116](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/EmployeeShifts.ts#L116)

___

### getNewUtensilChangeUpdates

▸ **getNewUtensilChangeUpdates**(`utensil`, `quantity`, `reason?`): `PartialWithFieldValue`<`IUtensil`\>

This function updates the quantity and percent of a utensil, adds a new change to its history, and
returns the local and server updates.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `utensil` | `IUtensil` | an object representing a utensil, with properties such as currentQuantity, optimalQuantity, and changes (an array of past changes made to the utensil) |
| `quantity` | `number` | The quantity of the utensil being added or removed. |
| `reason?` | `string` | An optional string parameter that represents the reason for the utensil change. It is used to provide additional context or explanation for the change. If not provided, it will be undefined. |

#### Returns

`PartialWithFieldValue`<`IUtensil`\>

An object with two properties: "localUpdates" and "serverUpdates".

#### Defined in

[src/utensils/Utensil.ts:46](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utensils/Utensil.ts#L46)

___

### getOvertimeRateOfPay

▸ **getOvertimeRateOfPay**(`shiftsArray`, `multiplier`): `number`

Calculate the overtime rate of pay

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `shiftsArray` | `IShift`[] | - |
| `multiplier` | `number` | Multiplier for the wage |

#### Returns

`number`

#### Defined in

[src/ScheduleRTDB/ShiftData.ts:25](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ShiftData.ts#L25)

___

### getRemoveMemberData

▸ **getRemoveMemberData**(`board`, `memberId`): `undefined` \| { `createdAt?`: `number` \| `FieldValue` ; `description?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `string`\> ; `details?`: `FieldValue` \| `PartialWithFieldValue`<{ `admins?`: `string`[] ; `members?`: `string`[] ; `parentId`: `string` ; `position?`: `string` ; `privacyLevel`: `PrivacyLevel`  }\> ; `global?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `boolean`\> ; `id?`: `string` \| `FieldValue` ; `name?`: `string` \| `FieldValue` ; `refPath?`: `string` \| `FieldValue` ; `updatedAt?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `number`\>  }

Remove a member from the board.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `board` | `IBoard` | - |
| `memberId` | `string` | The member to remove. |

#### Returns

`undefined` \| { `createdAt?`: `number` \| `FieldValue` ; `description?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `string`\> ; `details?`: `FieldValue` \| `PartialWithFieldValue`<{ `admins?`: `string`[] ; `members?`: `string`[] ; `parentId`: `string` ; `position?`: `string` ; `privacyLevel`: `PrivacyLevel`  }\> ; `global?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `boolean`\> ; `id?`: `string` \| `FieldValue` ; `name?`: `string` \| `FieldValue` ; `refPath?`: `string` \| `FieldValue` ; `updatedAt?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `number`\>  }

#### Defined in

[src/boards/boardHelpers.ts:93](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/boardHelpers.ts#L93)

___

### getRenameData

▸ **getRenameData**(`file`, `newName`): `undefined` \| `string`

Updates the name of this file

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `file` | `ICuttinboard_File` | - |
| `newName` | `string` | The new name for this file |

#### Returns

`undefined` \| `string`

#### Defined in

[src/files/Cuttinboard_File.ts:39](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/files/Cuttinboard_File.ts#L39)

___

### getRestoreShiftData

▸ **getRestoreShiftData**(`shift`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/ScheduleRTDB/EmployeeShifts.ts:103](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/EmployeeShifts.ts#L103)

___

### getScheduleSummaryByDay

▸ **getScheduleSummaryByDay**(`sd`, `day`): `WageDataByDay`[`number`]

#### Parameters

| Name | Type |
| :------ | :------ |
| `sd` | `IScheduleDoc` |
| `day` | `number` |

#### Returns

`WageDataByDay`[`number`]

#### Defined in

[src/ScheduleRTDB/ScheduleHelpers.ts:43](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleHelpers.ts#L43)

___

### getScheduleTotalProjectedSales

▸ **getScheduleTotalProjectedSales**(`sd`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sd` | `IScheduleDoc` |

#### Returns

`number`

#### Defined in

[src/ScheduleRTDB/ScheduleHelpers.ts:37](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleHelpers.ts#L37)

___

### getScheduleWeekStart

▸ **getScheduleWeekStart**(`year`, `weekNumber`): `Date`

#### Parameters

| Name | Type |
| :------ | :------ |
| `year` | `number` |
| `weekNumber` | `number` |

#### Returns

`Date`

#### Defined in

[src/ScheduleRTDB/ScheduleHelpers.ts:32](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleHelpers.ts#L32)

___

### getShiftAttribute

▸ **getShiftAttribute**<`T`\>(`shift`, `attribute`): `T` \| `undefined`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |
| `attribute` | keyof `IPrimaryShiftData` |

#### Returns

`T` \| `undefined`

#### Defined in

[src/ScheduleRTDB/Shift.ts:181](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/Shift.ts#L181)

___

### getShiftBaseData

▸ **getShiftBaseData**(`shift`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `end` | `Dayjs` |
| `notes` | `undefined` \| `string` |
| `position` | `undefined` \| `string` |
| `start` | `Dayjs` |

#### Defined in

[src/ScheduleRTDB/Shift.ts:172](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/Shift.ts#L172)

___

### getShiftBaseWage

▸ **getShiftBaseWage**(`shift`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |

#### Returns

`number`

#### Defined in

[src/ScheduleRTDB/Shift.ts:162](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/Shift.ts#L162)

___

### getShiftDayjsDate

▸ **getShiftDayjsDate**(`shift`, `date`, `latest?`): `Dayjs`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `shift` | `IShift` | `undefined` |
| `date` | ``"end"`` \| ``"start"`` | `undefined` |
| `latest` | `boolean` | `true` |

#### Returns

`Dayjs`

#### Defined in

[src/ScheduleRTDB/Shift.ts:119](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/Shift.ts#L119)

___

### getShiftDuration

▸ **getShiftDuration**(`shift`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `totalHours` | `number` |
| `totalMinutes` | `number` |

#### Defined in

[src/ScheduleRTDB/Shift.ts:135](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/Shift.ts#L135)

___

### getShiftIsoWeekday

▸ **getShiftIsoWeekday**(`shift`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |

#### Returns

`number`

#### Defined in

[src/ScheduleRTDB/Shift.ts:131](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/Shift.ts#L131)

___

### getShiftLatestData

▸ **getShiftLatestData**(`shift`): `IShift`

#### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |

#### Returns

`IShift`

#### Defined in

[src/ScheduleRTDB/Shift.ts:191](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/Shift.ts#L191)

___

### getSingleEmpShifts

▸ **getSingleEmpShifts**(`employees`, `shifts`): `IShift`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `employees` | `IEmployee`[] |
| `shifts` | `IShift`[] |

#### Returns

`IShift`[]

#### Defined in

[src/ScheduleRTDB/scheduleSelectors.ts:21](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/scheduleSelectors.ts#L21)

___

### getUpdateBoardData

▸ **getUpdateBoardData**(`board`, `updates`): `PartialWithFieldValue`<`IBoard`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `board` | `IBoard` |
| `updates` | `BoardUpdate` |

#### Returns

`PartialWithFieldValue`<`IBoard`\>

#### Defined in

[src/boards/boardHelpers.ts:35](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/boardHelpers.ts#L35)

___

### getUpdateShiftData

▸ **getUpdateShiftData**(`shift`, `pendingUpdate`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |
| `pendingUpdate` | `Partial`<`IPrimaryShiftData`\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/ScheduleRTDB/EmployeeShifts.ts:58](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/EmployeeShifts.ts#L58)

___

### getUpdatesCount

▸ **getUpdatesCount**(`employeeShifts`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `employeeShifts` | `undefined` \| `IShift`[] |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `deleted` | `number` |
| `newOrDraft` | `number` |
| `pendingUpdates` | `number` |
| `total` | `number` |

#### Defined in

[src/ScheduleRTDB/scheduleMathHelpers.ts:71](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/scheduleMathHelpers.ts#L71)

___

### getUpdatesCountArray

▸ **getUpdatesCountArray**(`employees`, `shifts`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `employees` | `IEmployee`[] |
| `shifts` | `IShift`[] |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `deleted` | `number` |
| `newOrDraft` | `number` |
| `pendingUpdates` | `number` |
| `total` | `number` |

#### Defined in

[src/ScheduleRTDB/scheduleSelectors.ts:24](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/scheduleSelectors.ts#L24)

___

### getUpdatesCountFromArray

▸ **getUpdatesCountFromArray**(`employeeShifts`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `employeeShifts` | `IShift`[] |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `deleted` | `number` |
| `newOrDraft` | `number` |
| `pendingUpdates` | `number` |
| `total` | `number` |

#### Defined in

[src/ScheduleRTDB/scheduleMathHelpers.ts:101](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/scheduleMathHelpers.ts#L101)

___

### getWageData

▸ **getWageData**(`employees`, `shifts`, `scheduleSettings`): `Record`<`string`, `WageDataRecord`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `employees` | `IEmployee`[] |
| `shifts` | `IShift`[] |
| `scheduleSettings` | `IScheduleSettings` |

#### Returns

`Record`<`string`, `WageDataRecord`\>

#### Defined in

[src/ScheduleRTDB/scheduleSelectors.ts:32](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/scheduleSelectors.ts#L32)

___

### getWageOptions

▸ **getWageOptions**(`shiftSettings`): `WageOptions` \| `undefined`

#### Parameters

| Name | Type |
| :------ | :------ |
| `shiftSettings` | `undefined` \| `IScheduleSettings` |

#### Returns

`WageOptions` \| `undefined`

#### Defined in

[src/ScheduleRTDB/ShiftData.ts:183](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ShiftData.ts#L183)

___

### getWeekDays

▸ **getWeekDays**(`weekId`): `Dayjs`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `weekId` | `string` |

#### Returns

`Dayjs`[]

#### Defined in

[src/ScheduleRTDB/scheduleMathHelpers.ts:57](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/scheduleMathHelpers.ts#L57)

___

### getWeekFullNumberByDate

▸ **getWeekFullNumberByDate**(`date`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `date` | `Dayjs` |

#### Returns

`number`

#### Defined in

[src/ScheduleRTDB/scheduleMathHelpers.ts:41](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/scheduleMathHelpers.ts#L41)

___

### getWeekSummary

▸ **getWeekSummary**(`wageData`, `scheduleDocument?`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `wageData` | `Record`<`string`, `WageDataRecord`\> |
| `scheduleDocument?` | `IScheduleDoc` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `byDay` | `WageDataByDay` |
| `total` | { `laborPercentage`: `number` = 0; `normalHours`: `number` = 0; `normalWage`: `number` = 0; `overtimeHours`: `number` = 0; `overtimeWage`: `number` = 0; `projectedSales`: `number` = totalProjectedSales; `totalHours`: `number` = 0; `totalPeople`: `number` = 0; `totalShifts`: `number` = 0; `totalWage`: `number` = 0 } |
| `total.laborPercentage` | `number` |
| `total.normalHours` | `number` |
| `total.normalWage` | `number` |
| `total.overtimeHours` | `number` |
| `total.overtimeWage` | `number` |
| `total.projectedSales` | `number` |
| `total.totalHours` | `number` |
| `total.totalPeople` | `number` |
| `total.totalShifts` | `number` |
| `total.totalWage` | `number` |

#### Defined in

[src/ScheduleRTDB/scheduleMathHelpers.ts:152](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/scheduleMathHelpers.ts#L152)

___

### joinLocation

▸ **joinLocation**(`location`): `Promise`<`void`\>

If the user is the owner of the location. This method allows the user to join/leave the location as a member.

#### Parameters

| Name | Type |
| :------ | :------ |
| `location` | `ILocation` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/cuttinboardLocation/Location.ts:61](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/Location.ts#L61)

___

### leaveLocation

▸ **leaveLocation**(`location`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `location` | `ILocation` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/cuttinboardLocation/Location.ts:70](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/Location.ts#L70)

___

### listReducer

▸ **listReducer**<`T`\>(`idKey`, `sorter?`): (`state`: `T`[], `action`: [`ListReducerAction`](modules.md#listreduceraction)<`T`\>) => `T`[]

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `idKey` | keyof `T` |
| `sorter?` | (`a`: `T`, `b`: `T`) => `number` |

#### Returns

`fn`

▸ (`state?`, `action`): `T`[]

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `state` | `T`[] | `[]` |
| `action` | [`ListReducerAction`](modules.md#listreduceraction)<`T`\> | `undefined` |

##### Returns

`T`[]

#### Defined in

[src/utils/listReducer.ts:13](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utils/listReducer.ts#L13)

___

### minutesToTextDuration

▸ **minutesToTextDuration**(`totalMinutes`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `totalMinutes` | `number` |

#### Returns

`string`

#### Defined in

[src/ScheduleRTDB/scheduleMathHelpers.ts:47](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/scheduleMathHelpers.ts#L47)

___

### ownOpenShift

▸ **ownOpenShift**(`shift`, `employee`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |
| `employee` | `IEmployee` |

#### Returns

`Object`

| Name | Type | Description |
| :------ | :------ | :------ |
| `deleting?` | `boolean` | - |
| `employeeId` | `string` | - |
| `end` | `string` | The end time of the shift. |
| `hourlyWage` | `number` | - |
| `id` | `string` | - |
| `locationId` | `string` | - |
| `locationName` | `string` | - |
| `notes?` | `string` | Additional notes about the shift. |
| `pendingUpdate` | ``null`` | - |
| `position?` | `string` | The position of the employee during the shift. |
| `start` | `string` | The start time of the shift. |
| `status` | ``"draft"`` \| ``"published"`` | - |
| `updatedAt` | `number` | - |
| `weekId` | `string` | - |
| `weekOrderFactor` | `number` | - |

#### Defined in

[src/ScheduleRTDB/Shift.ts:97](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/Shift.ts#L97)

___

### parseWeekId

▸ **parseWeekId**(`weekId`): `WeekInfo`

#### Parameters

| Name | Type |
| :------ | :------ |
| `weekId` | `string` |

#### Returns

`WeekInfo`

#### Defined in

[src/ScheduleRTDB/scheduleMathHelpers.ts:34](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/scheduleMathHelpers.ts#L34)

___

### removeBoardHost

▸ **removeBoardHost**(`hostId`): `Object`

Remove a host from the board.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hostId` | `string` | The host to remove. |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `createdAt?` | `number` \| `FieldValue` |
| `description?` | `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `string`\> |
| `details?` | `FieldValue` \| `PartialWithFieldValue`<{ `admins?`: `string`[] ; `members?`: `string`[] ; `parentId`: `string` ; `position?`: `string` ; `privacyLevel`: `PrivacyLevel`  }\> |
| `global?` | `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `boolean`\> |
| `id?` | `string` \| `FieldValue` |
| `name?` | `string` \| `FieldValue` |
| `refPath?` | `string` \| `FieldValue` |
| `updatedAt?` | `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `number`\> |

#### Defined in

[src/boards/boardHelpers.ts:61](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/boardHelpers.ts#L61)

___

### removeChecklist

▸ **removeChecklist**(`checklistObject`, `checklistKey`): `Partial`<`IChecklistGroup`\>

This function removes a checklist from a checklist group object and updates the order of the
remaining checklists.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `checklistObject` | `IChecklistGroup` | An object of type IChecklistGroup, which contains a list of checklists. |
| `checklistKey` | `string` | The ID of the checklist section to be removed from the checklistObject. |

#### Returns

`Partial`<`IChecklistGroup`\>

An object with two properties: `serverUpdates` and `localUpdates`.

#### Defined in

[src/checklistsGroups/checklistGroupUtils.ts:85](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/checklistGroupUtils.ts#L85)

___

### removeChecklistTask

▸ **removeChecklistTask**(`baseObject`, `checklistId`, `taskKey`): `Object`

Delete a task from a checklist.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `baseObject` | `IChecklistGroup` | - |
| `checklistId` | `string` | - |
| `taskKey` | `string` | The key of the task to delete. |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `checklists` | {} |

#### Defined in

[src/tasks/tasksUtils.ts:97](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/tasks/tasksUtils.ts#L97)

___

### removeConversationMembers

▸ **removeConversationMembers**(`membersToRemove`): `PartialWithFieldValue`<`IConversation`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `membersToRemove` | `IEmployee`[] |

#### Returns

`PartialWithFieldValue`<`IConversation`\>

#### Defined in

[src/conversations/conversationUtils.ts:62](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/conversationUtils.ts#L62)

___

### removePeriodicTask

▸ **removePeriodicTask**(`id`): `Object`

The function removes a periodic task from a server update object using its ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | The `id` parameter is a string that represents the unique identifier of a periodic task that needs to be removed. |

#### Returns

`Object`

The function `removePeriodicTask` returns an object `serverUpdates` which has a property
`tasks` that is an object with a key-value pair where the key is the `id` passed as an argument to
the function and the value is the result of calling the `deleteField()` function.

| Name | Type |
| :------ | :------ |
| `tasks` | {} |

#### Defined in

[src/recurringTasks/RecurringTask.ts:62](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/recurringTasks/RecurringTask.ts#L62)

___

### reorderChecklistTask

▸ **reorderChecklistTask**(`baseObject`, `checklistId`, `taskKey`, `toIndex`): `Partial`<`IChecklistGroup`\>

Update the order of a task in a checklist.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `baseObject` | `IChecklistGroup` | - |
| `checklistId` | `string` | - |
| `taskKey` | `string` | The key of the task to move. |
| `toIndex` | `number` | - |

#### Returns

`Partial`<`IChecklistGroup`\>

#### Defined in

[src/tasks/tasksUtils.ts:146](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/tasks/tasksUtils.ts#L146)

___

### reorderChecklists

▸ **reorderChecklists**(`checklistObject`, `checklistKey`, `toIndex`): `Partial`<`IChecklistGroup`\>

This function reorders checklists in a checklist group by updating their order attribute and
returning the server and local updates.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `checklistObject` | `IChecklistGroup` | An object that represents a group of checklists. It has a property called "checklists" which is an object containing individual checklists as key-value pairs. |
| `checklistKey` | `string` | The ID of the checklist to be reordered. |
| `toIndex` | `number` | The index where the checklist being moved should be placed in the updated order of checklists. |

#### Returns

`Partial`<`IChecklistGroup`\>

An object with two properties: `serverUpdates` and `localUpdates`.

#### Defined in

[src/checklistsGroups/checklistGroupUtils.ts:181](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/checklistGroupUtils.ts#L181)

___

### resetAllTasks

▸ **resetAllTasks**(`checklistObject`): ``null`` \| `Partial`<`IChecklistGroup`\>

This function resets all tasks in a checklist object to false.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `checklistObject` | `IChecklistGroup` | The checklistObject parameter is an object that represents a group of checklists. It contains an array of checklists, each of which contains an array of tasks. Each task has a status property that indicates whether it has been completed or not. The resetAllTasks function takes this object as input and returns |

#### Returns

``null`` \| `Partial`<`IChecklistGroup`\>

An object with two properties: `serverUpdates` and `localUpdates`.

#### Defined in

[src/checklistsGroups/checklistGroupUtils.ts:49](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/checklistGroupUtils.ts#L49)

___

### sendMessage

▸ **sendMessage**(`message`, `reference`, `uploadAttachment?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `IMessage` |
| `reference` | `DocumentReference`<`DocumentData`\> |
| `uploadAttachment?` | `Object` |
| `uploadAttachment.image` | `string` |
| `uploadAttachment.uploadFn` | (`messageId`: `string`) => `Promise`<`string`\> |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/messages/MessagesProvider.tsx:183](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/messages/MessagesProvider.tsx#L183)

___

### swapShifts

▸ **swapShifts**(`from`, `to`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `from` | `Object` |
| `from.employee` | `IEmployee` |
| `from.shift` | `IShift` |
| `to` | `Object` |
| `to.employee` | `IEmployee` |
| `to.shift` | `IShift` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `fromShift` | { `deleting?`: `boolean` ; `employeeId`: `string` = to.employee.id; `end`: `string` ; `hourlyWage`: `number` = toHourlyWage; `id`: `string` ; `locationId`: `string` ; `locationName`: `string` ; `notes?`: `string` ; `pendingUpdate`: ``null`` = null; `position?`: `string` ; `start`: `string` ; `status`: ``"draft"`` \| ``"published"`` ; `updatedAt`: `number` ; `weekId`: `string` ; `weekOrderFactor`: `number`  } |
| `fromShift.deleting?` | `boolean` |
| `fromShift.employeeId` | `string` |
| `fromShift.end` | `string` |
| `fromShift.hourlyWage` | `number` |
| `fromShift.id` | `string` |
| `fromShift.locationId` | `string` |
| `fromShift.locationName` | `string` |
| `fromShift.notes?` | `string` |
| `fromShift.pendingUpdate` | ``null`` |
| `fromShift.position?` | `string` |
| `fromShift.start` | `string` |
| `fromShift.status` | ``"draft"`` \| ``"published"`` |
| `fromShift.updatedAt` | `number` |
| `fromShift.weekId` | `string` |
| `fromShift.weekOrderFactor` | `number` |
| `toShift` | { `deleting?`: `boolean` ; `employeeId`: `string` = from.employee.id; `end`: `string` ; `hourlyWage`: `number` = fromHourlyWage; `id`: `string` ; `locationId`: `string` ; `locationName`: `string` ; `notes?`: `string` ; `pendingUpdate`: ``null`` = null; `position?`: `string` ; `start`: `string` ; `status`: ``"draft"`` \| ``"published"`` ; `updatedAt`: `number` ; `weekId`: `string` ; `weekOrderFactor`: `number`  } |
| `toShift.deleting?` | `boolean` |
| `toShift.employeeId` | `string` |
| `toShift.end` | `string` |
| `toShift.hourlyWage` | `number` |
| `toShift.id` | `string` |
| `toShift.locationId` | `string` |
| `toShift.locationName` | `string` |
| `toShift.notes?` | `string` |
| `toShift.pendingUpdate` | ``null`` |
| `toShift.position?` | `string` |
| `toShift.start` | `string` |
| `toShift.status` | ``"draft"`` \| ``"published"`` |
| `toShift.updatedAt` | `number` |
| `toShift.weekId` | `string` |
| `toShift.weekOrderFactor` | `number` |

#### Defined in

[src/ScheduleRTDB/Shift.ts:51](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/Shift.ts#L51)

___

### toggleCompleted

▸ **toggleCompleted**(`rtd`, `taskId`): `Object`

This function toggles the completion status of a task in a recurring task document and returns
server updates.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rtd` | `IRecurringTaskDoc` | IRecurringTaskDoc, which is likely an interface or type definition for a document or object representing a recurring task. |
| `taskId` | `string` | taskId is a string parameter representing the ID of a task within a recurring task document. |

#### Returns

`Object`

an object with a property `tasks` which is an object with a single key-value pair. The key
is the `taskId` parameter passed to the function, and the value is another object with a single
key-value pair. The key is `completed` and the value is either `null` or a string representing the
current date in the format "YYYY-MM-DD", depending on

| Name | Type |
| :------ | :------ |
| `tasks` | {} |

#### Defined in

[src/recurringTasks/RecurringTask.ts:96](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/recurringTasks/RecurringTask.ts#L96)

___

### toggleMuteConversation

▸ **toggleMuteConversation**(`conversation`): `undefined` \| { `createdAt?`: `number` \| `FieldValue` ; `description?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `string`\> ; `guests?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `string`[]\> ; `id?`: `string` \| `FieldValue` ; `locationId?`: `string` \| `FieldValue` ; `locationName?`: `string` \| `FieldValue` ; `members?`: `FieldValue` \| `PartialWithFieldValue`<`Record`<`string`, `boolean`\>\> ; `name?`: `string` \| `FieldValue` ; `organizationId?`: `string` \| `FieldValue` ; `position?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `string`\> ; `privacyLevel?`: `FieldValue` \| `PartialWithFieldValue`<`PrivacyLevel`\> ; `recentMessage?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `number`\> ; `updatedAt?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `number`\>  }

#### Parameters

| Name | Type |
| :------ | :------ |
| `conversation` | `IConversation` |

#### Returns

`undefined` \| { `createdAt?`: `number` \| `FieldValue` ; `description?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `string`\> ; `guests?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `string`[]\> ; `id?`: `string` \| `FieldValue` ; `locationId?`: `string` \| `FieldValue` ; `locationName?`: `string` \| `FieldValue` ; `members?`: `FieldValue` \| `PartialWithFieldValue`<`Record`<`string`, `boolean`\>\> ; `name?`: `string` \| `FieldValue` ; `organizationId?`: `string` \| `FieldValue` ; `position?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `string`\> ; `privacyLevel?`: `FieldValue` \| `PartialWithFieldValue`<`PrivacyLevel`\> ; `recentMessage?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `number`\> ; `updatedAt?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `number`\>  }

#### Defined in

[src/conversations/conversationUtils.ts:43](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/conversationUtils.ts#L43)

___

### toggleMuteDM

▸ **toggleMuteDM**(`dm`): `undefined` \| { `createdAt?`: `number` \| `FieldValue` ; `id?`: `string` \| `FieldValue` ; `members?`: `FieldValue` \| `PartialWithFieldValue`<`Record`<`string`, `Sender`\>\> ; `muted?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `string`[]\> ; `onlyOneMember?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `boolean`\> ; `recentMessage?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `number`\> ; `updatedAt?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `number`\>  }

#### Parameters

| Name | Type |
| :------ | :------ |
| `dm` | `IDirectMessage` |

#### Returns

`undefined` \| { `createdAt?`: `number` \| `FieldValue` ; `id?`: `string` \| `FieldValue` ; `members?`: `FieldValue` \| `PartialWithFieldValue`<`Record`<`string`, `Sender`\>\> ; `muted?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `string`[]\> ; `onlyOneMember?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `boolean`\> ; `recentMessage?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `number`\> ; `updatedAt?`: `FieldValue` \| `PartialWithFieldValue`<`undefined` \| `number`\>  }

#### Defined in

[src/directMessages/dmUtils.ts:27](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/dmUtils.ts#L27)

___

### updateChecklist

▸ **updateChecklist**(`checklistId`, `checklist`): `Object`

The function updates a checklist object with new name and description properties and returns both a
local and server update.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `checklistId` | `string` | The ID of the checklist that needs to be updated. |
| `checklist` | `Partial`<{ `description`: `string` ; `name`: `string`  }\> | The `checklist` parameter is an object that contains partial updates to a checklist. It can include updates to the `name` and `description` properties of the checklist. |

#### Returns

`Object`

An object with two properties: `localUpdate` and `serverUpdate`.

| Name | Type |
| :------ | :------ |
| `checklists` | {} |

#### Defined in

[src/checklistsGroups/checklistGroupUtils.ts:223](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/checklistGroupUtils.ts#L223)

___

### updatePeriodicTask

▸ **updatePeriodicTask**(`task`, `id`): `Object`

This function updates a recurring task and returns the updated task as part of a server update
object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `task` | `IRecurringTask` | The task parameter is an object that represents a recurring task. It likely contains properties such as the task's name, description, frequency, start date, and end date. |
| `id` | `string` | The `id` parameter is a string representing the unique identifier of the recurring task that needs to be updated. |

#### Returns

`Object`

The function `updatePeriodicTask` returns an object `serverUpdates` with a property `tasks`
that contains an object with a key-value pair where the key is the `id` parameter and the value is
the `task` parameter.

| Name | Type |
| :------ | :------ |
| `tasks` | {} |

#### Defined in

[src/recurringTasks/RecurringTask.ts:79](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/recurringTasks/RecurringTask.ts#L79)

___

### updateTask

▸ **updateTask**(`checklistId`, `taskKey`, `name`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `checklistId` | `string` |
| `taskKey` | `string` |
| `name` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `checklists` | {} |

#### Defined in

[src/tasks/tasksUtils.ts:9](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/tasks/tasksUtils.ts#L9)

___

### useAddEmployee

▸ **useAddEmployee**(): (`values`: `Omit`<`EmployeeData`, ``"locationId"``\>) => `Promise`<`string`\>

Hook for creating employees using an HTTPS callable function

#### Returns

`fn`

▸ (`values`): `Promise`<`string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `values` | `Omit`<`EmployeeData`, ``"locationId"``\> |

##### Returns

`Promise`<`string`\>

#### Defined in

[src/employee/useAddEmployee.tsx:47](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/employee/useAddEmployee.tsx#L47)

___

### useBoard

▸ **useBoard**(): [`IBoardContext`](interfaces/IBoardContext.md)

A hook that returns the board context

#### Returns

[`IBoardContext`](interfaces/IBoardContext.md)

The Board Context

#### Defined in

[src/boards/useBoard.tsx:8](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/useBoard.tsx#L8)

___

### useBoardsData

▸ **useBoardsData**(`boardCollection`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `boardCollection` | `BoardCollection` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `boards` | `IBoard`[] |
| `error` | `undefined` \| `Error` |
| `loading` | `boolean` |
| `selectBoardId` | `Dispatch`<`SetStateAction`<`undefined` \| `string`\>\> |
| `selectedBoard` | `undefined` \| `IBoard` |
| `selectedBoardId` | `undefined` \| `string` |

#### Defined in

[src/boards/useBoardsData.tsx:22](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/useBoardsData.tsx#L22)

___

### useChatPaths

▸ **useChatPaths**(`messagingType`): `ChatPaths`

#### Parameters

| Name | Type |
| :------ | :------ |
| `messagingType` | `MessageProviderMessagingType` |

#### Returns

`ChatPaths`

#### Defined in

[src/messages/useChatPaths.tsx:9](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/messages/useChatPaths.tsx#L9)

___

### useChecklist

▸ **useChecklist**(): `ChecklistContextProps`

#### Returns

`ChecklistContextProps`

#### Defined in

[src/checklistsGroups/ChecklistProvider.tsx:456](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/ChecklistProvider.tsx#L456)

___

### useConversations

▸ **useConversations**(): [`IConversationsContextProps`](interfaces/IConversationsContextProps.md)

A hook to get the conversations context

#### Returns

[`IConversationsContextProps`](interfaces/IConversationsContextProps.md)

The current conversations context

#### Defined in

[src/conversations/useConversations.tsx:11](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/useConversations.tsx#L11)

___

### useConversationsData

▸ **useConversationsData**(`locationId?`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `locationId?` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `conversations` | `IConversation`[] |
| `error` | `undefined` \| `Error` |
| `loading` | `boolean` |

#### Defined in

[src/conversations/useConversationsData.tsx:12](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/useConversationsData.tsx#L12)

___

### useCuttinboard

▸ **useCuttinboard**(): [`ICuttinboardContext`](interfaces/ICuttinboardContext.md) & { `user`: `User`  }

The `useCuttinboard` hook returns the `CuttinboardContext` value.

#### Returns

[`ICuttinboardContext`](interfaces/ICuttinboardContext.md) & { `user`: `User`  }

The `ICuttinboardContext` for the current user.

#### Defined in

[src/cuttinboard/useCuttinboard.tsx:9](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboard/useCuttinboard.tsx#L9)

___

### useCuttinboardData

▸ **useCuttinboardData**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `error` | `undefined` \| `Error` |
| `loading` | `boolean` |
| `notifications` | `INotifications` |
| `organizationKey` | `undefined` \| `IOrganizationKey` |
| `user` | `undefined` \| ``null`` \| `User` |

#### Defined in

[src/cuttinboard/useCuttinboardData.tsx:21](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboard/useCuttinboardData.tsx#L21)

___

### useCuttinboardLocation

▸ **useCuttinboardLocation**(): [`ILocationContextProps`](interfaces/ILocationContextProps.md) & { `location`: `ILocation`  }

#### Returns

[`ILocationContextProps`](interfaces/ILocationContextProps.md) & { `location`: `ILocation`  }

#### Defined in

[src/cuttinboardLocation/useCuttinboardLocation.tsx:5](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/useCuttinboardLocation.tsx#L5)

___

### useCuttinboardLocationRaw

▸ **useCuttinboardLocationRaw**(): [`ILocationContextProps`](interfaces/ILocationContextProps.md)

#### Returns

[`ILocationContextProps`](interfaces/ILocationContextProps.md)

#### Defined in

[src/cuttinboardLocation/useCuttinboardLocation.tsx:19](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/useCuttinboardLocation.tsx#L19)

___

### useCuttinboardRaw

▸ **useCuttinboardRaw**(): [`ICuttinboardContext`](interfaces/ICuttinboardContext.md)

#### Returns

[`ICuttinboardContext`](interfaces/ICuttinboardContext.md)

#### Defined in

[src/cuttinboard/useCuttinboard.tsx:23](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboard/useCuttinboard.tsx#L23)

___

### useDMData

▸ **useDMData**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `directMessages` | `IDirectMessage`[] |
| `error` | `undefined` \| `Error` |
| `loading` | `boolean` |

#### Defined in

[src/directMessages/useDMData.tsx:21](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/useDMData.tsx#L21)

___

### useDeleteAccount

▸ **useDeleteAccount**(): `DeleteAccountHook`

#### Returns

`DeleteAccountHook`

#### Defined in

[src/account/useDeleteAccount.tsx:16](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/account/useDeleteAccount.tsx#L16)

___

### useDirectMessageChat

▸ **useDirectMessageChat**(): [`DirectMessagesContext`](interfaces/DirectMessagesContext.md)

#### Returns

[`DirectMessagesContext`](interfaces/DirectMessagesContext.md)

#### Defined in

[src/directMessages/useDirectMessageChat.tsx:7](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/useDirectMessageChat.tsx#L7)

___

### useDisclose

▸ **useDisclose**(`initialState?`): `DiscloseHook`

Custom React hook for handling disclosure state.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `initialState` | `boolean` | `false` | Initial state of the disclosure. Defaults to `false`. |

#### Returns

`DiscloseHook`

- Tuple containing the current state, open function, close function, and toggle function.

#### Defined in

[src/utils/useDisclose.ts:33](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utils/useDisclose.ts#L33)

___

### useEmployees

▸ **useEmployees**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `deleteEmployee` | (`employee`: `IEmployee`) => `Promise`<`void`\> |
| `employees` | `IEmployee`[] |
| `getEmployeeById` | (`id`: `string`) => `undefined` \| `IEmployee` |
| `getEmployeesByRole` | (`searchText`: ``null`` \| `string`, `position`: ``null`` \| `string`) => [`string`, `IEmployee`[]][] |
| `updateEmployee` | (`employee`: `IEmployee`, `locationUpdates`: `Partial`<`EmployeeLocationInfo`\>) => `Promise`<`void`\> |

#### Defined in

[src/employee/useEmployees.tsx:16](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/employee/useEmployees.tsx#L16)

___

### useFiles

▸ **useFiles**(): [`FilesContextProps`](interfaces/FilesContextProps.md)

#### Returns

[`FilesContextProps`](interfaces/FilesContextProps.md)

#### Defined in

[src/files/FilesProvider.tsx:111](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/files/FilesProvider.tsx#L111)

___

### useFilesData

▸ **useFilesData**(`selectedBoard`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `selectedBoard` | `undefined` \| `IBoard` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `error` | `undefined` \| `Error` |
| `files` | `ICuttinboard_File`[] |
| `loading` | `boolean` |

#### Defined in

[src/files/useFilesData.tsx:12](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/files/useFilesData.tsx#L12)

___

### useFindDMRecipient

▸ **useFindDMRecipient**(`employees?`): (`rawEmail`: `string`, `locationId?`: `string`) => `Promise`<`ICuttinboardUser` \| `IEmployee`\>

Hook to find a recipient among the employees in a Firestore database.

**`Throws`**

- If no eligible user is found.

#### Parameters

| Name | Type |
| :------ | :------ |
| `employees?` | `IEmployee`[] |

#### Returns

`fn`

- A function that takes an email and optional locationId as arguments and returns the employee object.

▸ (`rawEmail`, `locationId?`): `Promise`<`ICuttinboardUser` \| `IEmployee`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `rawEmail` | `string` |
| `locationId?` | `string` |

##### Returns

`Promise`<`ICuttinboardUser` \| `IEmployee`\>

#### Defined in

[src/directMessages/useFindDMRecipient.tsx:24](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/useFindDMRecipient.tsx#L24)

___

### useGBoard

▸ **useGBoard**(): [`IGBoardContext`](interfaces/IGBoardContext.md)

A hook that returns the board context

#### Returns

[`IGBoardContext`](interfaces/IGBoardContext.md)

The Board Context

#### Defined in

[src/globalBoards/useGBoard.tsx:8](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/globalBoards/useGBoard.tsx#L8)

___

### useGBoardsData

▸ **useGBoardsData**(`boardCollection`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `boardCollection` | `BoardCollection` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `boards` | `IBoard`[] |
| `error` | `undefined` \| `Error` |
| `loading` | `boolean` |
| `selectBoardId` | `Dispatch`<`SetStateAction`<`undefined` \| `string`\>\> |
| `selectedBoard` | `undefined` \| `IBoard` |
| `selectedBoardId` | `undefined` \| `string` |

#### Defined in

[src/globalBoards/useGBoardsData.tsx:9](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/globalBoards/useGBoardsData.tsx#L9)

___

### useLocationData

▸ **useLocationData**(`organizationKey`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `organizationKey` | `IOrganizationKey` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `employees` | `IEmployee`[] |
| `employeesDispatch` | `Dispatch`<[`ListReducerAction`](modules.md#listreduceraction)<`IEmployee`\>\> |
| `error` | `undefined` \| `Error` |
| `loading` | `boolean` |
| `location` | `undefined` \| `ILocation` |
| `setLocation` | `Dispatch`<`SetStateAction`<`undefined` \| `ILocation`\>\> |

#### Defined in

[src/cuttinboardLocation/useLocationData.tsx:36](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/useLocationData.tsx#L36)

___

### useLocationPermissions

▸ **useLocationPermissions**(): (`permission`: [`Permission`](modules.md#permission)) => `undefined` \| `boolean`

#### Returns

`fn`

▸ (`permission`): `undefined` \| `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `permission` | [`Permission`](modules.md#permission) |

##### Returns

`undefined` \| `boolean`

#### Defined in

[src/employee/usePermissions.tsx:7](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/employee/usePermissions.tsx#L7)

___

### useMessages

▸ **useMessages**(): [`IMessagesContext`](interfaces/IMessagesContext.md)

#### Returns

[`IMessagesContext`](interfaces/IMessagesContext.md)

#### Defined in

[src/messages/useMessages.tsx:4](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/messages/useMessages.tsx#L4)

___

### useMyShifts

▸ **useMyShifts**(): [`MyShiftsContextProps`](interfaces/MyShiftsContextProps.md)

#### Returns

[`MyShiftsContextProps`](interfaces/MyShiftsContextProps.md)

#### Defined in

[src/myShifts/MyShiftsProvider.tsx:37](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/myShifts/MyShiftsProvider.tsx#L37)

___

### useMyShiftsData

▸ **useMyShiftsData**(`weekId`, `locationId?`): [`MyShiftsContextProps`](interfaces/MyShiftsContextProps.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `weekId` | `string` |
| `locationId?` | `string` |

#### Returns

[`MyShiftsContextProps`](interfaces/MyShiftsContextProps.md)

#### Defined in

[src/myShifts/useMyShiftsData.tsx:13](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/myShifts/useMyShiftsData.tsx#L13)

___

### useNotes

▸ **useNotes**(): [`NotesContextProps`](interfaces/NotesContextProps.md)

#### Returns

[`NotesContextProps`](interfaces/NotesContextProps.md)

#### Defined in

[src/notes/NotesProvider.tsx:98](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/notes/NotesProvider.tsx#L98)

___

### useNotesData

▸ **useNotesData**(`selectedBoard`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `selectedBoard` | `undefined` \| `IBoard` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `error` | `undefined` \| `Error` |
| `loading` | `boolean` |
| `notes` | `INote`[] |

#### Defined in

[src/notes/useNotesData.tsx:9](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/notes/useNotesData.tsx#L9)

___

### useNotifications

▸ **useNotifications**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `getBadgesByConversation` | (`conversationId`: `string`) => `number` |
| `getDMBadge` | (`notifications`: `INotifications`, `dmId`: `string`) => `number` |
| `getDMBadgesById` | (`dmId`: `string`) => `number` |
| `getScheduleBadges` | (`notifications`: `INotifications`) => `number` |
| `getTotalBadgesForConversations` | `number` |
| `getTotalDMBadges` | `number` |
| `getTotalScheduleBadges` | `number` |
| `removeConversationBadges` | (`conversationId`: `string`) => `Promise`<`void`\> |
| `removeDMBadge` | (`dmId`: `string`) => `Promise`<`void`\> |
| `removeScheduleBadges` | () => `Promise`<`void`\> |

#### Defined in

[src/notifications/useNotifications.tsx:13](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/notifications/useNotifications.tsx#L13)

___

### useRecurringTasks

▸ **useRecurringTasks**(): `RecurringTasksContextProps`

#### Returns

`RecurringTasksContextProps`

#### Defined in

[src/recurringTasks/RecurringTasksProvider.tsx:209](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/recurringTasks/RecurringTasksProvider.tsx#L209)

___

### useRegister

▸ **useRegister**(): `Object`

Custom Hook for registering a new user with email and password, and signing them in upon successful registration.

#### Returns

`Object`

An object with a `registerUser` function for registering the user, a `isSubmitting` boolean indicating if the registration process is ongoing, and an `error` property containing any error details that occurred during the registration process.

| Name | Type |
| :------ | :------ |
| `error` | `undefined` \| `Error` \| `AuthError` |
| `isSubmitting` | `boolean` |
| `registerUser` | (`registerData`: `RegisterProps`) => `Promise`<`User`\> |

#### Defined in

[src/account/useRegister.tsx:17](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/account/useRegister.tsx#L17)

___

### useSchedule

▸ **useSchedule**(): [`IScheduleContext`](interfaces/IScheduleContext.md)

#### Returns

[`IScheduleContext`](interfaces/IScheduleContext.md)

#### Defined in

[src/ScheduleRTDB/useSchedule.tsx:4](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/useSchedule.tsx#L4)

___

### useScheduleData

▸ **useScheduleData**(`weekId`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `weekId` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `error` | `undefined` \| `Error` |
| `loading` | `boolean` |
| `shifts` | `IShift`[] |
| `summaryDoc` | `IScheduleDoc` |

#### Defined in

[src/ScheduleRTDB/useScheduleData.tsx:17](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/useScheduleData.tsx#L17)

___

### useUpdateAccount

▸ **useUpdateAccount**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `error` | ``null`` \| `Error` |
| `updateUserProfile` | (`newProfileData`: ``null`` \| `ProfileUpdate`, `newContactData`: ``null`` \| `Partial`<`ContactUpdate`\>) => `Promise`<`void`\> |
| `updating` | `boolean` |

#### Defined in

[src/account/useUpdateAccount.tsx:11](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/account/useUpdateAccount.tsx#L11)

___

### useUtensils

▸ **useUtensils**(): `UtensilsContextProps`

#### Returns

`UtensilsContextProps`

#### Defined in

[src/utensils/UtensilsProvider.tsx:234](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utensils/UtensilsProvider.tsx#L234)

___

### weekToDate

▸ **weekToDate**(`year`, `isoWeekNo`): `dayjs.Dayjs`

#### Parameters

| Name | Type |
| :------ | :------ |
| `year` | `number` |
| `isoWeekNo` | `number` |

#### Returns

`dayjs.Dayjs`

#### Defined in

[src/ScheduleRTDB/scheduleMathHelpers.ts:18](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/scheduleMathHelpers.ts#L18)
