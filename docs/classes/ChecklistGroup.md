[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / ChecklistGroup

# Class: ChecklistGroup

ChecklistGroup is a class that represents checklists grouped in a Firestore Document.

## Implements

- [`IChecklistGroup`](../interfaces/IChecklistGroup.md)
- [`PrimaryFirestore`](../modules.md#primaryfirestore)

## Table of contents

### Constructors

- [constructor](ChecklistGroup.md#constructor)

### Properties

- [checklists](ChecklistGroup.md#checklists)
- [docRef](ChecklistGroup.md#docref)
- [id](ChecklistGroup.md#id)
- [locationId](ChecklistGroup.md#locationid)
- [firestoreConverter](ChecklistGroup.md#firestoreconverter)

### Accessors

- [summary](ChecklistGroup.md#summary)

### Methods

- [addChecklist](ChecklistGroup.md#addchecklist)
- [addTask](ChecklistGroup.md#addtask)
- [changeTaskStatus](ChecklistGroup.md#changetaskstatus)
- [deleteAllTasks](ChecklistGroup.md#deletealltasks)
- [getChecklistSummary](ChecklistGroup.md#getchecklistsummary)
- [removeChecklist](ChecklistGroup.md#removechecklist)
- [removeTask](ChecklistGroup.md#removetask)
- [resetAllTasks](ChecklistGroup.md#resetalltasks)
- [updateChecklist](ChecklistGroup.md#updatechecklist)
- [updateTask](ChecklistGroup.md#updatetask)

## Constructors

### constructor

• **new ChecklistGroup**(`data`, `firestoreBase`)

Create a new ChecklistGroup class instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`IChecklistGroup`](../interfaces/IChecklistGroup.md) | The data to create the checklist group with. |
| `firestoreBase` | [`PrimaryFirestore`](../modules.md#primaryfirestore) | The Firestore document reference and ID of the checklist group. |

#### Defined in

checklist/ChecklistGroup.ts:74

## Properties

### checklists

• `Optional` `Readonly` **checklists**: `Object`

A record of all the checklists in this group.

#### Index signature

▪ [key: `string`]: [`Checklist`](../modules.md#checklist)

#### Implementation of

[IChecklistGroup](../interfaces/IChecklistGroup.md).[checklists](../interfaces/IChecklistGroup.md#checklists)

#### Defined in

checklist/ChecklistGroup.ts:39

___

### docRef

• `Readonly` **docRef**: `DocumentReference`<`DocumentData`\>

The Firestore document reference of this checklist group.

#### Implementation of

PrimaryFirestore.docRef

#### Defined in

checklist/ChecklistGroup.ts:49

___

### id

• `Readonly` **id**: `string`

The ID of the document in Firestore.

#### Implementation of

PrimaryFirestore.id

#### Defined in

checklist/ChecklistGroup.ts:45

___

### locationId

• `Readonly` **locationId**: `string`

The ID of the location this checklist group is linked to.

#### Implementation of

[IChecklistGroup](../interfaces/IChecklistGroup.md).[locationId](../interfaces/IChecklistGroup.md#locationid)

#### Defined in

checklist/ChecklistGroup.ts:35

___

### firestoreConverter

▪ `Static` **firestoreConverter**: `FirestoreDataConverter`<[`ChecklistGroup`](ChecklistGroup.md)\>

Convert a Firestore document snapshot to a ChecklistGroup object.

#### Defined in

checklist/ChecklistGroup.ts:54

## Accessors

### summary

• `get` **summary**(): `Object`

Get a summary of the completion status of all the tasks in the checklists of this group.

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `completed` | `number` |
| `total` | `number` |

#### Defined in

checklist/ChecklistGroup.ts:87

## Methods

### addChecklist

▸ **addChecklist**(`sectionKey`, `newTask?`): `Promise`<`void`\>

Add a new checklist to this group.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sectionKey` | `string` | The key of the checklist to add. |
| `newTask?` | `Object` | If provided, a new task will be added to the checklist in the same operation. |
| `newTask.id` | `string` | - |
| `newTask.name` | `string` | - |

#### Returns

`Promise`<`void`\>

#### Defined in

checklist/ChecklistGroup.ts:312

___

### addTask

▸ **addTask**(`checklistKey`, `taskKey`, `task`): `Promise`<`void`\>

Add a new task to a checklist.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `checklistKey` | `string` | The key of the checklist to add the task to. |
| `taskKey` | `string` | The key of the task to add. |
| `task` | `string` | The task to add. |

#### Returns

`Promise`<`void`\>

#### Defined in

checklist/ChecklistGroup.ts:184

___

### changeTaskStatus

▸ **changeTaskStatus**(`checklistKey`, `taskKey`, `status`): `Promise`<`void`\>

Update the status of a task.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `checklistKey` | `string` | The key of the checklist that contains the task. |
| `taskKey` | `string` | The key of the task to update. |
| `status` | `boolean` | The new status of the task. |

#### Returns

`Promise`<`void`\>

#### Defined in

checklist/ChecklistGroup.ts:151

___

### deleteAllTasks

▸ **deleteAllTasks**(): `Promise`<`void`\>

Delete of checklist and all its tasks from this group.

#### Returns

`Promise`<`void`\>

#### Defined in

checklist/ChecklistGroup.ts:422

___

### getChecklistSummary

▸ **getChecklistSummary**(`sectionKey`): `Object`

Get a summary of the completion status of a specific checklist in this group.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sectionKey` | `string` | The key of the checklist to get the summary of. |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `completed` | `number` |
| `total` | `number` |

#### Defined in

checklist/ChecklistGroup.ts:119

___

### removeChecklist

▸ **removeChecklist**(`checklistKey`): `Promise`<`void`\>

Remove a checklist from this group.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `checklistKey` | `string` | The key of the checklist to remove. |

#### Returns

`Promise`<`void`\>

#### Defined in

checklist/ChecklistGroup.ts:290

___

### removeTask

▸ **removeTask**(`sectionKey`, `taskKey`): `Promise`<`void`\>

Delete a task from a checklist.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sectionKey` | `string` | The key of the checklist to delete the task from. |
| `taskKey` | `string` | The key of the task to delete. |

#### Returns

`Promise`<`void`\>

#### Defined in

checklist/ChecklistGroup.ts:226

___

### resetAllTasks

▸ **resetAllTasks**(): `Promise`<`void`\>

Reset the status of all the tasks in all the checklists of this group.

#### Returns

`Promise`<`void`\>

#### Defined in

checklist/ChecklistGroup.ts:250

___

### updateChecklist

▸ **updateChecklist**(`checklistKey`, `checklist`): `Promise`<`void`\>

Update a specific checklist.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `checklistKey` | `string` | The key of the checklist to update. |
| `checklist` | `PartialWithFieldValue`<`Omit`<[`Checklist`](../modules.md#checklist), ``"tasks"``\>\> | The new checklist data. |

#### Returns

`Promise`<`void`\>

#### Defined in

checklist/ChecklistGroup.ts:399

___

### updateTask

▸ **updateTask**(`checklistKey`, `taskKey`, `task`): `Promise`<`void`\>

Update a specific task in a checklist.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `checklistKey` | `string` | The key of the checklist to update. |
| `taskKey` | `string` | The key of the task to update. |
| `task` | `PartialWithFieldValue`<[`Task`](../modules.md#task)\> | The new task data. |

#### Returns

`Promise`<`void`\>

#### Defined in

checklist/ChecklistGroup.ts:369
