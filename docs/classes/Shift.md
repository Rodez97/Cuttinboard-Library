[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / Shift

# Class: Shift

A class that represents a shift in the database.

## Implements

- [`IShift`](../interfaces/IShift.md)
- [`PrimaryFirestore`](../modules.md#primaryfirestore)
- [`FirebaseSignature`](../modules.md#firebasesignature)

## Table of contents

### Constructors

- [constructor](Shift.md#constructor)

### Properties

- [\_hourlyWage](Shift.md#_hourlywage)
- [\_notes](Shift.md#_notes)
- [\_position](Shift.md#_position)
- [\_wageData](Shift.md#_wagedata)
- [createdAt](Shift.md#createdat)
- [createdBy](Shift.md#createdby)
- [deleting](Shift.md#deleting)
- [docRef](Shift.md#docref)
- [end](Shift.md#end)
- [id](Shift.md#id)
- [pendingUpdate](Shift.md#pendingupdate)
- [start](Shift.md#start)
- [status](Shift.md#status)
- [updatedAt](Shift.md#updatedat)

### Accessors

- [getBaseWage](Shift.md#getbasewage)
- [getEndDayjsDate](Shift.md#getenddayjsdate)
- [getStartDayjsDate](Shift.md#getstartdayjsdate)
- [hasPendingUpdates](Shift.md#haspendingupdates)
- [hourlyWage](Shift.md#hourlywage)
- [notes](Shift.md#notes)
- [origData](Shift.md#origdata)
- [position](Shift.md#position)
- [shiftDuration](Shift.md#shiftduration)
- [shiftIsoWeekday](Shift.md#shiftisoweekday)
- [wageData](Shift.md#wagedata)

### Methods

- [calculateHourlyWage](Shift.md#calculatehourlywage)
- [cancelUpdate](Shift.md#cancelupdate)
- [delete](Shift.md#delete)
- [editShift](Shift.md#editshift)
- [restore](Shift.md#restore)
- [toDate](Shift.md#todate)
- [toString](Shift.md#tostring)

## Constructors

### constructor

• **new Shift**(`data`, `firestoreBase`)

Creates an instance of Shift.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`IShift`](../interfaces/IShift.md) & [`FirebaseSignature`](../modules.md#firebasesignature)<`Timestamp`\> | Data to create a shift from |
| `firestoreBase` | [`PrimaryFirestore`](../modules.md#primaryfirestore) | The id and docRef of the shift |

#### Defined in

schedule/Shift.ts:164

## Properties

### \_hourlyWage

• `Private` `Optional` `Readonly` **\_hourlyWage**: `number`

Wage per hour of the shift

#### Defined in

schedule/Shift.ts:79

___

### \_notes

• `Private` `Optional` `Readonly` **\_notes**: `string`

Short notes about the shift

#### Defined in

schedule/Shift.ts:75

___

### \_position

• `Private` `Optional` `Readonly` **\_position**: `string`

Position associated with the shift

#### Defined in

schedule/Shift.ts:71

___

### \_wageData

• `Private` **\_wageData**: `Object`

Get the wage data of the shift

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `normalHours` | `number` | Number of hours worked without overtime |
| `normalWage` | `number` | Wage for normal hours |
| `overtimeHours` | `number` | Number of overtime hours worked |
| `overtimeWage` | `number` | Wage for overtime hours |
| `totalHours` | `number` | Total worked hours - `normalHours + overtimeHours` |
| `totalWage` | `number` | Total wage - `normalWage + overtimeWage` |

#### Defined in

schedule/Shift.ts:101

___

### createdAt

• `Readonly` **createdAt**: `Timestamp`

Timestamp of when the shift was created

#### Implementation of

FirebaseSignature.createdAt

#### Defined in

schedule/Shift.ts:53

___

### createdBy

• `Readonly` **createdBy**: `string`

Id of the user who created the shift

#### Implementation of

FirebaseSignature.createdBy

#### Defined in

schedule/Shift.ts:57

___

### deleting

• `Optional` `Readonly` **deleting**: `boolean`

True if the shift is marked for deletion.

#### Implementation of

[IShift](../interfaces/IShift.md).[deleting](../interfaces/IShift.md#deleting)

#### Defined in

schedule/Shift.ts:93

___

### docRef

• `Readonly` **docRef**: `DocumentReference`<`DocumentData`\>

Document reference of the shift

#### Implementation of

PrimaryFirestore.docRef

#### Defined in

schedule/Shift.ts:49

___

### end

• `Readonly` **end**: `string`

End date of the shift in string format
- Format: `DD-MM-YYYY HH:mm` (e.g. 01-01-2021 12:00)

#### Implementation of

[IShift](../interfaces/IShift.md).[end](../interfaces/IShift.md#end)

#### Defined in

schedule/Shift.ts:67

___

### id

• `Readonly` **id**: `string`

Id of the shift

#### Implementation of

PrimaryFirestore.id

#### Defined in

schedule/Shift.ts:45

___

### pendingUpdate

• `Optional` `Readonly` **pendingUpdate**: `Partial`<[`IShift`](../interfaces/IShift.md)\>

An object containing the pending updates to the shift as a partial shift object.

#### Implementation of

[IShift](../interfaces/IShift.md).[pendingUpdate](../interfaces/IShift.md#pendingupdate)

#### Defined in

schedule/Shift.ts:89

___

### start

• `Readonly` **start**: `string`

Start date of the shift in string format
- Format: `DD-MM-YYYY HH:mm` (e.g. 01-01-2021 12:00)

#### Implementation of

[IShift](../interfaces/IShift.md).[start](../interfaces/IShift.md#start)

#### Defined in

schedule/Shift.ts:62

___

### status

• `Readonly` **status**: ``"draft"`` \| ``"published"``

The current status of the shift
- `draft` - The shift is not published
- `published` - The shift is published

#### Implementation of

[IShift](../interfaces/IShift.md).[status](../interfaces/IShift.md#status)

#### Defined in

schedule/Shift.ts:85

___

### updatedAt

• `Readonly` **updatedAt**: `Timestamp`

Timestamp of when the shift was last updated

#### Implementation of

[IShift](../interfaces/IShift.md).[updatedAt](../interfaces/IShift.md#updatedat)

#### Defined in

schedule/Shift.ts:97

## Accessors

### getBaseWage

• `get` **getBaseWage**(): `number`

Get the base wage for the shift based on the hourly wage and the duration of the shift

#### Returns

`number`

#### Defined in

schedule/Shift.ts:294

___

### getEndDayjsDate

• `get` **getEndDayjsDate**(): `Dayjs`

Get the end date as a dayjs date

#### Returns

`Dayjs`

#### Defined in

schedule/Shift.ts:239

___

### getStartDayjsDate

• `get` **getStartDayjsDate**(): `Dayjs`

Get the start date as a dayjs date

#### Returns

`Dayjs`

#### Defined in

schedule/Shift.ts:228

___

### hasPendingUpdates

• `get` **hasPendingUpdates**(): `boolean`

True if the shift has a pending update

#### Returns

`boolean`

#### Defined in

schedule/Shift.ts:256

___

### hourlyWage

• `get` **hourlyWage**(): `number`

Wage per hour of the shift

#### Returns

`number`

#### Implementation of

[IShift](../interfaces/IShift.md).[hourlyWage](../interfaces/IShift.md#hourlywage)

#### Defined in

schedule/Shift.ts:218

___

### notes

• `get` **notes**(): `undefined` \| `string`

Get the notes associated with the shift

#### Returns

`undefined` \| `string`

#### Implementation of

[IShift](../interfaces/IShift.md).[notes](../interfaces/IShift.md#notes)

#### Defined in

schedule/Shift.ts:208

___

### origData

• `get` **origData**(): `Object`

Get the base data of the shift independent of pending updates.
- User to show the actual data in the UI. (My Shifts)

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `end` | `Dayjs` |
| `notes` | `undefined` \| `string` |
| `position` | `undefined` \| `string` |
| `start` | `Dayjs` |

#### Defined in

schedule/Shift.ts:134

___

### position

• `get` **position**(): `undefined` \| `string`

Get the position associated with the shift

#### Returns

`undefined` \| `string`

#### Implementation of

[IShift](../interfaces/IShift.md).[position](../interfaces/IShift.md#position)

#### Defined in

schedule/Shift.ts:198

___

### shiftDuration

• `get` **shiftDuration**(): `Object`

Duration of the shift in hours and minutes

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `totalHours` | `number` |
| `totalMinutes` | `number` |

#### Defined in

schedule/Shift.ts:263

___

### shiftIsoWeekday

• `get` **shiftIsoWeekday**(): `number`

Get ISO week number of the shift start date

#### Returns

`number`

#### Defined in

schedule/Shift.ts:249

___

### wageData

• `get` **wageData**(): `Object`

Get the wage data for the shift

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

schedule/Shift.ts:306

• `set` **wageData**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `Object` |
| `value.normalHours` | `number` |
| `value.normalWage` | `number` |
| `value.overtimeHours` | `number` |
| `value.overtimeWage` | `number` |
| `value.totalHours` | `number` |
| `value.totalWage` | `number` |

#### Returns

`void`

#### Defined in

schedule/Shift.ts:330

## Methods

### calculateHourlyWage

▸ **calculateHourlyWage**(`accumulatedHours`, `hoursLimit`, `overtimeRateOfPay`): `void`

Calculate the shift wage data based on the overtime settings

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accumulatedHours` | `number` | The accumulated hours from previous shifts in the week, set to 0 if you want to calculate the wage data for the current shift only or daily overtime |
| `hoursLimit` | `number` | The overtime hours limit |
| `overtimeRateOfPay` | `number` | The overtime rate of pay |

#### Returns

`void`

#### Defined in

schedule/Shift.ts:405

___

### cancelUpdate

▸ **cancelUpdate**(): `Promise`<`void`\>

Cancel pending update

#### Returns

`Promise`<`void`\>

#### Defined in

schedule/Shift.ts:357

___

### delete

▸ **delete**(): `Promise`<`void`\>

Delete shift

#### Returns

`Promise`<`void`\>

#### Defined in

schedule/Shift.ts:369

___

### editShift

▸ **editShift**(`pendingUpdate`): `Promise`<`void`\>

Edits the current shift

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pendingUpdate` | `Partial`<[`IShift`](../interfaces/IShift.md)\> | The pending update |

#### Returns

`Promise`<`void`\>

#### Defined in

schedule/Shift.ts:345

___

### restore

▸ **restore**(): `Promise`<`void`\>

Restore a pending deletion shift

#### Returns

`Promise`<`void`\>

#### Defined in

schedule/Shift.ts:390

___

### toDate

▸ `Static` **toDate**(`date`): `Dayjs`

Parses a string into a dayjs date

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `date` | `string` | date string |

#### Returns

`Dayjs`

#### Defined in

schedule/Shift.ts:147

___

### toString

▸ `Static` **toString**(`date`): `string`

Converts a shift formatted Date to a string

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `date` | `Date` | date to convert |

#### Returns

`string`

#### Defined in

schedule/Shift.ts:155
