[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / IScheduleContext

# Interface: IScheduleContext

## Table of contents

### Properties

- [cancelShiftUpdate](IScheduleContext.md#cancelshiftupdate)
- [cloneWeek](IScheduleContext.md#cloneweek)
- [createShift](IScheduleContext.md#createshift)
- [deleteShift](IScheduleContext.md#deleteshift)
- [employeeShifts](IScheduleContext.md#employeeshifts)
- [error](IScheduleContext.md#error)
- [loading](IScheduleContext.md#loading)
- [position](IScheduleContext.md#position)
- [publish](IScheduleContext.md#publish)
- [restoreShift](IScheduleContext.md#restoreshift)
- [searchQuery](IScheduleContext.md#searchquery)
- [setPosition](IScheduleContext.md#setposition)
- [setSearchQuery](IScheduleContext.md#setsearchquery)
- [setWeekId](IScheduleContext.md#setweekid)
- [shifts](IScheduleContext.md#shifts)
- [summaryDoc](IScheduleContext.md#summarydoc)
- [updateProjectedSales](IScheduleContext.md#updateprojectedsales)
- [updateShift](IScheduleContext.md#updateshift)
- [updatesCount](IScheduleContext.md#updatescount)
- [wageData](IScheduleContext.md#wagedata)
- [weekDays](IScheduleContext.md#weekdays)
- [weekId](IScheduleContext.md#weekid)
- [weekSummary](IScheduleContext.md#weeksummary)

## Properties

### cancelShiftUpdate

• **cancelShiftUpdate**: (`shift`: `IShift`) => `Promise`<`void`\>

#### Type declaration

▸ (`shift`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:108](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L108)

___

### cloneWeek

• **cloneWeek**: (`targetWeekId`: `string`, `employees`: `string`[]) => `Promise`<`void`\>

#### Type declaration

▸ (`targetWeekId`, `employees`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `targetWeekId` | `string` |
| `employees` | `string`[] |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:93](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L93)

___

### createShift

• **createShift**: (`shift`: `IShift`, `dates`: `Dayjs`[], `applyToWeekDays`: `number`[]) => `Promise`<`void`\>

#### Type declaration

▸ (`shift`, `dates`, `applyToWeekDays`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |
| `dates` | `Dayjs`[] |
| `applyToWeekDays` | `number`[] |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:88](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L88)

___

### deleteShift

• **deleteShift**: (`shift`: `IShift`) => `Promise`<`void`\>

#### Type declaration

▸ (`shift`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:109](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L109)

___

### employeeShifts

• **employeeShifts**: { `employee`: `IEmployee` ; `key`: `string` ; `shifts`: `IShift`[]  }[]

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:78](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L78)

___

### error

• `Optional` **error**: `Error`

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:115](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L115)

___

### loading

• **loading**: `boolean`

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:114](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L114)

___

### position

• **position**: `string`

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:86](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L86)

___

### publish

• **publish**: (`notificationRecipients`: ``"all"`` \| ``"none"`` \| ``"all_scheduled"`` \| ``"changed"``) => `Promise`<`void`\>

#### Type declaration

▸ (`notificationRecipients`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `notificationRecipients` | ``"all"`` \| ``"none"`` \| ``"all_scheduled"`` \| ``"changed"`` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:81](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L81)

___

### restoreShift

• **restoreShift**: (`shift`: `IShift`) => `Promise`<`void`\>

#### Type declaration

▸ (`shift`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:110](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L110)

___

### searchQuery

• **searchQuery**: `string`

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:84](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L84)

___

### setPosition

• **setPosition**: `Dispatch`<`SetStateAction`<`string`\>\>

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:87](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L87)

___

### setSearchQuery

• **setSearchQuery**: `Dispatch`<`SetStateAction`<`string`\>\>

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:85](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L85)

___

### setWeekId

• **setWeekId**: `Dispatch`<`SetStateAction`<`string`\>\>

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:75](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L75)

___

### shifts

• **shifts**: `IShift`[]

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:77](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L77)

___

### summaryDoc

• `Optional` **summaryDoc**: `IScheduleDoc`

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:76](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L76)

___

### updateProjectedSales

• **updateProjectedSales**: (`projectedSalesByDay`: `Record`<`number`, `number`\>) => `Promise`<`void`\>

#### Type declaration

▸ (`projectedSalesByDay`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `projectedSalesByDay` | `Record`<`number`, `number`\> |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:111](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L111)

___

### updateShift

• **updateShift**: (`shift`: `IShift`, `extra`: `Partial`<`IPrimaryShiftData`\>) => `Promise`<`void`\>

#### Type declaration

▸ (`shift`, `extra`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | `IShift` |
| `extra` | `Partial`<`IPrimaryShiftData`\> |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:104](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L104)

___

### updatesCount

• **updatesCount**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `deleted` | `number` |
| `newOrDraft` | `number` |
| `pendingUpdates` | `number` |
| `total` | `number` |

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:116](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L116)

___

### wageData

• **wageData**: `Dictionary`<{ `shifts`: `Map`<`string`, { `isoWeekDay`: `number` ; `wageData`: `ShiftWage`  }\> ; `summary`: `WageDataByDay`  }\>

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:94](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L94)

___

### weekDays

• **weekDays**: `Dayjs`[]

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:79](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L79)

___

### weekId

• **weekId**: `string`

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:74](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L74)

___

### weekSummary

• **weekSummary**: `WeekSummary`

#### Defined in

[src/ScheduleRTDB/ScheduleProvider.tsx:80](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/ScheduleRTDB/ScheduleProvider.tsx#L80)
