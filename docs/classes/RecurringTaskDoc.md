[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / RecurringTaskDoc

# Class: RecurringTaskDoc

The RecurringTaskDoc class represents a RecurringTaskDoc document.
- A RecurringTaskDoc document contains a record of all recurring tasks for a location.

## Implements

- [`IRecurringTaskDoc`](../interfaces/IRecurringTaskDoc.md)
- [`PrimaryFirestore`](../modules.md#primaryfirestore)

## Table of contents

### Constructors

- [constructor](RecurringTaskDoc.md#constructor)

### Properties

- [docRef](RecurringTaskDoc.md#docref)
- [id](RecurringTaskDoc.md#id)
- [locationId](RecurringTaskDoc.md#locationid)
- [signedBy](RecurringTaskDoc.md#signedby)
- [tasks](RecurringTaskDoc.md#tasks)
- [firestoreConverter](RecurringTaskDoc.md#firestoreconverter)

### Accessors

- [tasksArray](RecurringTaskDoc.md#tasksarray)
- [tasksArraySorted](RecurringTaskDoc.md#tasksarraysorted)

### Methods

- [addPeriodicTask](RecurringTaskDoc.md#addperiodictask)
- [removePeriodicTask](RecurringTaskDoc.md#removeperiodictask)
- [updatePeriodicTask](RecurringTaskDoc.md#updateperiodictask)

## Constructors

### constructor

• **new RecurringTaskDoc**(`data`, `firestoreBase`)

Creates a new RecurringTaskDoc class instance.

**`Remarks`**

Since we get the recurring tasks as an object, we need to convert them to a RecurringTask class instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`IRecurringTaskDoc`](../interfaces/IRecurringTaskDoc.md) | RecurringTaskDoc data |
| `firestoreBase` | [`PrimaryFirestore`](../modules.md#primaryfirestore) | The id and document reference of the document |

#### Defined in

checklist/RecurringTask.ts:237

## Properties

### docRef

• `Readonly` **docRef**: `DocumentReference`<`DocumentData`\>

The document reference from the firestore database.

#### Implementation of

PrimaryFirestore.docRef

#### Defined in

checklist/RecurringTask.ts:189

___

### id

• `Readonly` **id**: `string`

The id of the document

#### Implementation of

PrimaryFirestore.id

#### Defined in

checklist/RecurringTask.ts:185

___

### locationId

• `Readonly` **locationId**: `string`

The id of the location this document belongs to

#### Implementation of

[IRecurringTaskDoc](../interfaces/IRecurringTaskDoc.md).[locationId](../interfaces/IRecurringTaskDoc.md#locationid)

#### Defined in

checklist/RecurringTask.ts:202

___

### signedBy

• `Optional` `Readonly` **signedBy**: `Object`

The last user who signed the document

**`Remarks`**

This is not used by now but it can be used in the future to track who signed the document.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `name` | `string` |

#### Implementation of

[IRecurringTaskDoc](../interfaces/IRecurringTaskDoc.md).[signedBy](../interfaces/IRecurringTaskDoc.md#signedby)

#### Defined in

checklist/RecurringTask.ts:195

___

### tasks

• `Optional` `Readonly` **tasks**: `Object`

The record of all recurring tasks for this location

#### Index signature

▪ [key: `string`]: [`RecurringTask`](RecurringTask.md)

#### Implementation of

[IRecurringTaskDoc](../interfaces/IRecurringTaskDoc.md).[tasks](../interfaces/IRecurringTaskDoc.md#tasks)

#### Defined in

checklist/RecurringTask.ts:206

___

### firestoreConverter

▪ `Static` **firestoreConverter**: `FirestoreDataConverter`<[`RecurringTaskDoc`](RecurringTaskDoc.md)\>

Converts a QueryDocumentSnapshot to a RecurringTaskDoc class instance.

#### Defined in

checklist/RecurringTask.ts:213

## Accessors

### tasksArray

• `get` **tasksArray**(): [`string`, [`RecurringTask`](RecurringTask.md)][]

Return an array of all recurring tasks extracted from the tasks object

#### Returns

[`string`, [`RecurringTask`](RecurringTask.md)][]

#### Defined in

checklist/RecurringTask.ts:255

___

### tasksArraySorted

• `get` **tasksArraySorted**(): [`string`, [`RecurringTask`](RecurringTask.md)][]

Return an array of all recurring tasks sorted by their next occurrence

#### Returns

[`string`, [`RecurringTask`](RecurringTask.md)][]

#### Defined in

checklist/RecurringTask.ts:262

## Methods

### addPeriodicTask

▸ **addPeriodicTask**(`task`, `id`): `Promise`<`void`\>

Add a new recurring task to the tasks object

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `task` | [`IRecurringTask`](../interfaces/IRecurringTask.md) | Recurring Task to add |
| `id` | `string` | Id of the task |

#### Returns

`Promise`<`void`\>

#### Defined in

checklist/RecurringTask.ts:273

___

### removePeriodicTask

▸ **removePeriodicTask**(`id`): `Promise`<`void`\>

Remove a recurring task from the tasks object by its id.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | Id of the task to remove |

#### Returns

`Promise`<`void`\>

#### Defined in

checklist/RecurringTask.ts:280

___

### updatePeriodicTask

▸ **updatePeriodicTask**(`task`, `id`): `Promise`<`void`\>

Update a recurring task in the tasks object by its id.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `task` | [`IRecurringTask`](../interfaces/IRecurringTask.md) | Recurring Task to update |
| `id` | `string` | Id of the task to update |

#### Returns

`Promise`<`void`\>

#### Defined in

checklist/RecurringTask.ts:292
