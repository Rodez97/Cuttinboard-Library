[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / IScheduleContext

# Interface: IScheduleContext

## Table of contents

### Properties

- [cloneWeek](IScheduleContext.md#cloneweek)
- [createShift](IScheduleContext.md#createshift)
- [employeeShiftsCollection](IScheduleContext.md#employeeshiftscollection)
- [position](IScheduleContext.md#position)
- [publish](IScheduleContext.md#publish)
- [scheduleDocument](IScheduleContext.md#scheduledocument)
- [scheduleSettingsData](IScheduleContext.md#schedulesettingsdata)
- [searchQuery](IScheduleContext.md#searchquery)
- [setPosition](IScheduleContext.md#setposition)
- [setSearchQuery](IScheduleContext.md#setsearchquery)
- [setWeekId](IScheduleContext.md#setweekid)
- [updates](IScheduleContext.md#updates)
- [weekDays](IScheduleContext.md#weekdays)
- [weekId](IScheduleContext.md#weekid)
- [weekSummary](IScheduleContext.md#weeksummary)

## Properties

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

schedule/ScheduleProvider.tsx:83

___

### createShift

• **createShift**: (`shift`: [`IShift`](IShift.md), `dates`: `Date`[], `applyToWeekDays`: `number`[], `id`: `string`, `employeeId`: `string`) => `Promise`<`void`\>

#### Type declaration

▸ (`shift`, `dates`, `applyToWeekDays`, `id`, `employeeId`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `shift` | [`IShift`](IShift.md) |
| `dates` | `Date`[] |
| `applyToWeekDays` | `number`[] |
| `id` | `string` |
| `employeeId` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

schedule/ScheduleProvider.tsx:70

___

### employeeShiftsCollection

• **employeeShiftsCollection**: [`EmployeeShifts`](../classes/EmployeeShifts.md)[]

#### Defined in

schedule/ScheduleProvider.tsx:59

___

### position

• **position**: `string`

#### Defined in

schedule/ScheduleProvider.tsx:68

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

schedule/ScheduleProvider.tsx:63

___

### scheduleDocument

• `Optional` **scheduleDocument**: [`ScheduleDoc`](../classes/ScheduleDoc.md)

#### Defined in

schedule/ScheduleProvider.tsx:58

___

### scheduleSettingsData

• `Optional` **scheduleSettingsData**: [`ScheduleSettings`](../modules.md#schedulesettings)

#### Defined in

schedule/ScheduleProvider.tsx:60

___

### searchQuery

• **searchQuery**: `string`

#### Defined in

schedule/ScheduleProvider.tsx:66

___

### setPosition

• **setPosition**: `Dispatch`<`SetStateAction`<`string`\>\>

#### Defined in

schedule/ScheduleProvider.tsx:69

___

### setSearchQuery

• **setSearchQuery**: `Dispatch`<`SetStateAction`<`string`\>\>

#### Defined in

schedule/ScheduleProvider.tsx:67

___

### setWeekId

• **setWeekId**: `Dispatch`<`SetStateAction`<`string`\>\>

#### Defined in

schedule/ScheduleProvider.tsx:57

___

### updates

• **updates**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `deleted` | `number` |
| `newOrDraft` | `number` |
| `pendingUpdates` | `number` |
| `total` | `number` |

#### Defined in

schedule/ScheduleProvider.tsx:77

___

### weekDays

• **weekDays**: `Date`[]

#### Defined in

schedule/ScheduleProvider.tsx:61

___

### weekId

• **weekId**: `string`

#### Defined in

schedule/ScheduleProvider.tsx:56

___

### weekSummary

• **weekSummary**: [`WeekSummary`](../modules.md#weeksummary)

#### Defined in

schedule/ScheduleProvider.tsx:62
