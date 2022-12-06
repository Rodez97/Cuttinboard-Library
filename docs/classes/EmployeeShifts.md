[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / EmployeeShifts

# Class: EmployeeShifts

EmployeeShifts is a Firestore document that contains the shifts for an employee for a given week.

## Implements

- [`IEmployeeShifts`](../interfaces/IEmployeeShifts.md)
- [`PrimaryFirestore`](../modules.md#primaryfirestore)
- [`FirebaseSignature`](../modules.md#firebasesignature)

## Table of contents

### Constructors

- [constructor](EmployeeShifts.md#constructor)

### Properties

- [\_wageData](EmployeeShifts.md#_wagedata)
- [createdAt](EmployeeShifts.md#createdat)
- [createdBy](EmployeeShifts.md#createdby)
- [docRef](EmployeeShifts.md#docref)
- [employeeId](EmployeeShifts.md#employeeid)
- [id](EmployeeShifts.md#id)
- [locationId](EmployeeShifts.md#locationid)
- [shifts](EmployeeShifts.md#shifts)
- [updatedAt](EmployeeShifts.md#updatedat)
- [weekId](EmployeeShifts.md#weekid)
- [Converter](EmployeeShifts.md#converter)

### Accessors

- [haveChanges](EmployeeShifts.md#havechanges)
- [shiftsArray](EmployeeShifts.md#shiftsarray)
- [summary](EmployeeShifts.md#summary)
- [wageData](EmployeeShifts.md#wagedata)

### Methods

- [batchPublish](EmployeeShifts.md#batchpublish)
- [batchUnpublish](EmployeeShifts.md#batchunpublish)
- [calculateWageData](EmployeeShifts.md#calculatewagedata)
- [checkForOverlappingShifts](EmployeeShifts.md#checkforoverlappingshifts)
- [createShift](EmployeeShifts.md#createshift)
- [getOvertimeRateOfPay](EmployeeShifts.md#getovertimerateofpay)
- [Reference](EmployeeShifts.md#reference)

## Constructors

### constructor

• **new EmployeeShifts**(`data`, `firestoreBase`)

Create a new instance of EmployeeShifts.

**`Remarks`**

- We need to convert the shifts objects to a Shift class instance before we can use them.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`IEmployeeShifts`](../interfaces/IEmployeeShifts.md) & [`FirebaseSignature`](../modules.md#firebasesignature)<`Timestamp`\> | The data to create the employee shifts with |
| `firestoreBase` | [`PrimaryFirestore`](../modules.md#primaryfirestore) | The id and docRef for the employee shifts |

#### Defined in

schedule/EmployeeShifts.ts:196

## Properties

### \_wageData

• `Private` **\_wageData**: [`WageDataByDay`](../modules.md#wagedatabyday)

Calculated the wage data for the employee shifts

#### Defined in

schedule/EmployeeShifts.ts:149

___

### createdAt

• `Readonly` **createdAt**: `Timestamp`

Timestamp of when the employee shifts document was created

#### Implementation of

FirebaseSignature.createdAt

#### Defined in

schedule/EmployeeShifts.ts:133

___

### createdBy

• `Readonly` **createdBy**: `string`

Id of the user that created the employee shifts document

#### Implementation of

FirebaseSignature.createdBy

#### Defined in

schedule/EmployeeShifts.ts:137

___

### docRef

• `Readonly` **docRef**: `DocumentReference`<`DocumentData`\>

The document reference for the employee shifts document

#### Implementation of

PrimaryFirestore.docRef

#### Defined in

schedule/EmployeeShifts.ts:129

___

### employeeId

• `Readonly` **employeeId**: `string`

The id of the employee linked to the shifts

#### Implementation of

[IEmployeeShifts](../interfaces/IEmployeeShifts.md).[employeeId](../interfaces/IEmployeeShifts.md#employeeid)

#### Defined in

schedule/EmployeeShifts.ts:116

___

### id

• `Readonly` **id**: `string`

The id of the employee shifts document

#### Implementation of

PrimaryFirestore.id

#### Defined in

schedule/EmployeeShifts.ts:125

___

### locationId

• `Readonly` **locationId**: `string`

ID of the location linked to the employee shifts

#### Implementation of

[IEmployeeShifts](../interfaces/IEmployeeShifts.md).[locationId](../interfaces/IEmployeeShifts.md#locationid)

#### Defined in

schedule/EmployeeShifts.ts:145

___

### shifts

• `Optional` `Readonly` **shifts**: `Record`<`string`, [`Shift`](Shift.md)\> = `{}`

Record of shifts by day number.
- Key is the ISO week day number
- Value is an array of shifts for that day

#### Implementation of

[IEmployeeShifts](../interfaces/IEmployeeShifts.md).[shifts](../interfaces/IEmployeeShifts.md#shifts)

#### Defined in

schedule/EmployeeShifts.ts:112

___

### updatedAt

• `Readonly` **updatedAt**: `Timestamp`

Timestamp of when the employee shifts document was last updated

#### Implementation of

[IEmployeeShifts](../interfaces/IEmployeeShifts.md).[updatedAt](../interfaces/IEmployeeShifts.md#updatedat)

#### Defined in

schedule/EmployeeShifts.ts:141

___

### weekId

• `Readonly` **weekId**: `string`

The id of the week linked to the shifts

**`See`**

[WEEKFORMAT](../modules.md#weekformat)

#### Implementation of

[IEmployeeShifts](../interfaces/IEmployeeShifts.md).[weekId](../interfaces/IEmployeeShifts.md#weekid)

#### Defined in

schedule/EmployeeShifts.ts:121

___

### Converter

▪ `Static` **Converter**: `Object`

Firestore Data Converter

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<[`IEmployeeShifts`](../interfaces/IEmployeeShifts.md) & [`FirebaseSignature`](../modules.md#firebasesignature)<`Timestamp`\>\>, `options`: `SnapshotOptions`) => [`EmployeeShifts`](EmployeeShifts.md) |
| `toFirestore` | (`object`: [`EmployeeShifts`](EmployeeShifts.md)) => `DocumentData` |

#### Defined in

schedule/EmployeeShifts.ts:154

## Accessors

### haveChanges

• `get` **haveChanges**(): `boolean`

Check is the employee's schedule have any changes or is unpublished

#### Returns

`boolean`

#### Defined in

schedule/EmployeeShifts.ts:337

___

### shiftsArray

• `get` **shiftsArray**(): [`Shift`](Shift.md)[]

Get the shifts array from the shifts object and sort it by start time in ascending order (earliest to latest)

#### Returns

[`Shift`](Shift.md)[]

#### Defined in

schedule/EmployeeShifts.ts:232

___

### summary

• `get` **summary**(): `Object`

Get the total summary of the wage data for the employee shifts

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

schedule/EmployeeShifts.ts:307

___

### wageData

• `get` **wageData**(): [`WageDataByDay`](../modules.md#wagedatabyday)

Get the wage data for the employee shifts
- This is calculated from the shifts

**`Remarks`**

- This is a getter so that it is only calculated when it is needed.
- If the wageData is already calculated, it will return the cached value.
- If the wageData is not calculated, it will calculate it and cache it.

#### Returns

[`WageDataByDay`](../modules.md#wagedatabyday)

#### Defined in

schedule/EmployeeShifts.ts:252

• `set` **wageData**(`value`): `void`

Private method to update the wage data for the employee shifts

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`WageDataByDay`](../modules.md#wagedatabyday) |

#### Returns

`void`

#### Defined in

schedule/EmployeeShifts.ts:300

## Methods

### batchPublish

▸ **batchPublish**(`batch`): `void`

Publishes all shifts in the schedule

**`Remarks`**

It is recommended to use a batch to publish multiple schedules at once

**`Example`**

```typescript
const batch = writeBatch(firestore);
await schedule.batchPublish(batch);
await batch.commit();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `batch` | `WriteBatch` | Firestore batch |

#### Returns

`void`

#### Defined in

schedule/EmployeeShifts.ts:515

___

### batchUnpublish

▸ **batchUnpublish**(`batch`): `void`

Unpublish all shifts in the schedule

**`Remarks`**

It is recommended to use a batch to unpublish multiple schedules at once

**`Example`**

```typescript
const batch = writeBatch(firestore);
await schedule.batchUnpublish(batch);
await batch.commit();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `batch` | `WriteBatch` | Firestore batch |

#### Returns

`void`

#### Defined in

schedule/EmployeeShifts.ts:574

___

### calculateWageData

▸ **calculateWageData**(`args?`): `void`

Initialize/Calculate the wage data for the employee's schedule for the week
based on the *overtime* settings for the location and the employee's wage

- If there is no overtime settings for the location, the wage data will be
calculated based on the employee's wage only

- If this functions in not called, the wage data will be the default value without overtime

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `args` | ``null`` \| { `hoursLimit`: `number` ; `mode`: ``"weekly"`` \| ``"daily"`` ; `multiplier`: `number`  } | `null` | The overtime settings for the location |

#### Returns

`void`

#### Defined in

schedule/EmployeeShifts.ts:357

___

### checkForOverlappingShifts

▸ **checkForOverlappingShifts**(`start`, `end`, `shiftId`): `boolean`

Check if a new shift start or end time overlaps with an existing shift

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start` | `Dayjs` | The start time of the new shift |
| `end` | `Dayjs` | The end time of the new shift |
| `shiftId` | `string` | The id of the shift to ignore |

#### Returns

`boolean`

#### Defined in

schedule/EmployeeShifts.ts:606

___

### createShift

▸ **createShift**(`shift`, `dates`, `applyToWeekDays`, `id`): `Promise`<`void`\>

Creates a new shift and adds it to the schedule.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `shift` | [`IShift`](../interfaces/IShift.md) | The shift to add |
| `dates` | `Date`[] | The dates to add the shift to |
| `applyToWeekDays` | `number`[] | The weekdays to apply the shift to |
| `id` | `string` | The id of the shift |

#### Returns

`Promise`<`void`\>

#### Defined in

schedule/EmployeeShifts.ts:453

___

### getOvertimeRateOfPay

▸ **getOvertimeRateOfPay**(`multiplier`): `number`

Calculate the overtime rate of pay

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `multiplier` | `number` | Multiplier for the wage |

#### Returns

`number`

#### Defined in

schedule/EmployeeShifts.ts:645

___

### Reference

▸ `Static` **Reference**(`weekId`): ``null`` \| `Query`<[`EmployeeShifts`](EmployeeShifts.md)\>

Get the collection reference for the employee shifts for the current location
- the location data is stored in the __globalThis__ *(globalThis.locationData)*

**`See`**

[WEEKFORMAT](../modules.md#weekformat)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `weekId` | `string` | The weekId for the week to get the employee shifts for. |

#### Returns

``null`` \| `Query`<[`EmployeeShifts`](EmployeeShifts.md)\>

#### Defined in

schedule/EmployeeShifts.ts:175
