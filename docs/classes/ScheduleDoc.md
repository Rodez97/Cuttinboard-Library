[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / ScheduleDoc

# Class: ScheduleDoc

A ScheduleDoc is a document that contains the basic information about a week's schedule.

## Implements

- [`IScheduleDoc`](../interfaces/IScheduleDoc.md)
- [`PrimaryFirestore`](../modules.md#primaryfirestore)
- [`FirebaseSignature`](../modules.md#firebasesignature)

## Table of contents

### Constructors

- [constructor](ScheduleDoc.md#constructor)

### Properties

- [createdAt](ScheduleDoc.md#createdat)
- [createdBy](ScheduleDoc.md#createdby)
- [docRef](ScheduleDoc.md#docref)
- [id](ScheduleDoc.md#id)
- [locationId](ScheduleDoc.md#locationid)
- [notificationRecipients](ScheduleDoc.md#notificationrecipients)
- [projectedSalesByDay](ScheduleDoc.md#projectedsalesbyday)
- [scheduleSummary](ScheduleDoc.md#schedulesummary)
- [updatedAt](ScheduleDoc.md#updatedat)
- [weekId](ScheduleDoc.md#weekid)
- [weekNumber](ScheduleDoc.md#weeknumber)
- [year](ScheduleDoc.md#year)
- [firestoreConverter](ScheduleDoc.md#firestoreconverter)

### Accessors

- [getWeekStart](ScheduleDoc.md#getweekstart)
- [totalProjectedSales](ScheduleDoc.md#totalprojectedsales)

### Methods

- [getSummaryByDay](ScheduleDoc.md#getsummarybyday)
- [updateProjectedSales](ScheduleDoc.md#updateprojectedsales)
- [createDefaultScheduleDoc](ScheduleDoc.md#createdefaultscheduledoc)

## Constructors

### constructor

• **new ScheduleDoc**(`data`, `firestoreBase`)

Creates a new ScheduleDoc instance from the raw data.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`IScheduleDoc`](../interfaces/IScheduleDoc.md) & [`FirebaseSignature`](../modules.md#firebasesignature)<`Timestamp`\> | The data to create the ScheduleDoc from. |
| `firestoreBase` | [`PrimaryFirestore`](../modules.md#primaryfirestore) | The id and document reference of the document. |

#### Defined in

schedule/ScheduleDoc.ts:168

## Properties

### createdAt

• `Readonly` **createdAt**: `Timestamp`

The time that this document was created.

#### Implementation of

FirebaseSignature.createdAt

#### Defined in

schedule/ScheduleDoc.ts:87

___

### createdBy

• `Readonly` **createdBy**: `string`

The id of the user who created this document.

#### Implementation of

FirebaseSignature.createdBy

#### Defined in

schedule/ScheduleDoc.ts:91

___

### docRef

• `Readonly` **docRef**: `DocumentReference`<`DocumentData`\>

The document reference for this document.

#### Implementation of

PrimaryFirestore.docRef

#### Defined in

schedule/ScheduleDoc.ts:83

___

### id

• `Readonly` **id**: `string`

The id of the document.
- The format is `${weekId}_${locationId}`

**`See`**

WEEKFORMAT

**`Example`**

```ts
"W-23-2022_zxcv1234567654321"
```

#### Implementation of

PrimaryFirestore.id

#### Defined in

schedule/ScheduleDoc.ts:79

___

### locationId

• `Readonly` **locationId**: `string`

The id of the location that this schedule is for.

#### Implementation of

[IScheduleDoc](../interfaces/IScheduleDoc.md).[locationId](../interfaces/IScheduleDoc.md#locationid)

#### Defined in

schedule/ScheduleDoc.ts:44

___

### notificationRecipients

• `Optional` `Readonly` **notificationRecipients**: `string`[]

When we publish the schedule, we send the ids of the people who should receive notifications so that we can send them a notification from the cloud function.
This is an array of user ids.

#### Implementation of

[IScheduleDoc](../interfaces/IScheduleDoc.md).[notificationRecipients](../interfaces/IScheduleDoc.md#notificationrecipients)

#### Defined in

schedule/ScheduleDoc.ts:57

___

### projectedSalesByDay

• `Optional` `Readonly` **projectedSalesByDay**: `Record`<`number`, `number`\>

The projected sales for each day of the week.

#### Implementation of

[IScheduleDoc](../interfaces/IScheduleDoc.md).[projectedSalesByDay](../interfaces/IScheduleDoc.md#projectedsalesbyday)

#### Defined in

schedule/ScheduleDoc.ts:61

___

### scheduleSummary

• `Readonly` **scheduleSummary**: [`WeekSummary`](../modules.md#weeksummary)

The summary of the week.

#### Implementation of

[IScheduleDoc](../interfaces/IScheduleDoc.md).[scheduleSummary](../interfaces/IScheduleDoc.md#schedulesummary)

#### Defined in

schedule/ScheduleDoc.ts:72

___

### updatedAt

• `Readonly` **updatedAt**: `Timestamp`

The time that this document was last updated.
This is a firebase timestamp.

**`See`**

https://firebase.google.com/docs/reference/js/firebase.firestore.Timestamp
- We use this to track when we need to send notifications to people.

#### Implementation of

[IScheduleDoc](../interfaces/IScheduleDoc.md).[updatedAt](../interfaces/IScheduleDoc.md#updatedat)

#### Defined in

schedule/ScheduleDoc.ts:68

___

### weekId

• `Readonly` **weekId**: `string`

The id of the week.

**`See`**

WEEKFORMAT

#### Implementation of

[IScheduleDoc](../interfaces/IScheduleDoc.md).[weekId](../interfaces/IScheduleDoc.md#weekid)

#### Defined in

schedule/ScheduleDoc.ts:40

___

### weekNumber

• `Readonly` **weekNumber**: `number`

The ISO week number of the schedule.

#### Implementation of

[IScheduleDoc](../interfaces/IScheduleDoc.md).[weekNumber](../interfaces/IScheduleDoc.md#weeknumber)

#### Defined in

schedule/ScheduleDoc.ts:52

___

### year

• `Readonly` **year**: `number`

The year of the schedule.

#### Implementation of

[IScheduleDoc](../interfaces/IScheduleDoc.md).[year](../interfaces/IScheduleDoc.md#year)

#### Defined in

schedule/ScheduleDoc.ts:48

___

### firestoreConverter

▪ `Static` **firestoreConverter**: `Object`

Firestore data converter for ScheduleDoc.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<[`IScheduleDoc`](../interfaces/IScheduleDoc.md) & [`FirebaseSignature`](../modules.md#firebasesignature)<`Timestamp`\>\>, `options`: `SnapshotOptions`) => [`ScheduleDoc`](ScheduleDoc.md) |
| `toFirestore` | (`object`: [`ScheduleDoc`](ScheduleDoc.md)) => `DocumentData` |

#### Defined in

schedule/ScheduleDoc.ts:96

## Accessors

### getWeekStart

• `get` **getWeekStart**(): `Date`

Get the first day of the week.

#### Returns

`Date`

#### Defined in

schedule/ScheduleDoc.ts:200

___

### totalProjectedSales

• `get` **totalProjectedSales**(): `number`

Get the sum of the projected sales for the week.

#### Returns

`number`

#### Defined in

schedule/ScheduleDoc.ts:208

## Methods

### getSummaryByDay

▸ **getSummaryByDay**(`day`): `Object`

Get the wage and hours summary of the week's schedule.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `day` | `number` | The day of the week to get the summary for. |

#### Returns

`Object`

| Name | Type | Description |
| :------ | :------ | :------ |
| `normalHours` | `number` | Number of hours worked without overtime |
| `normalWage` | `number` | The total wage for normal hours |
| `overtimeHours` | `number` | Number of overtime hours worked |
| `overtimeWage` | `number` | The wage for overtime hours |
| `people` | `number` | How many people were scheduled for the day |
| `totalHours` | `number` | The sum of the normal and overtime hours |
| `totalShifts` | `number` | Number of shifts for the day |
| `totalWage` | `number` | The total wage for the day - normalWage + overtimeWage |

#### Defined in

schedule/ScheduleDoc.ts:219

___

### updateProjectedSales

▸ **updateProjectedSales**(`projectedSalesByDay`): `Promise`<`void`\>

Update the projected sales for the week.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `projectedSalesByDay` | `Record`<`number`, `number`\> | The projected sales for each day of the week. |

#### Returns

`Promise`<`void`\>

#### Defined in

schedule/ScheduleDoc.ts:246

___

### createDefaultScheduleDoc

▸ `Static` **createDefaultScheduleDoc**(`weekId`): [`ScheduleDoc`](ScheduleDoc.md)

Creates a Default ScheduleDoc for a given week.

#### Parameters

| Name | Type |
| :------ | :------ |
| `weekId` | `string` |

#### Returns

[`ScheduleDoc`](ScheduleDoc.md)

#### Defined in

schedule/ScheduleDoc.ts:114
