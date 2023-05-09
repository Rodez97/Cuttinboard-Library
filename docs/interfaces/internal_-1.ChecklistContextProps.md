[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / [<internal\>](../modules/internal_-1.md) / ChecklistContextProps

# Interface: ChecklistContextProps

[<internal>](../modules/internal_-1.md).ChecklistContextProps

## Table of contents

### Properties

- [addNewChecklist](internal_-1.ChecklistContextProps.md#addnewchecklist)
- [addTaskToChecklist](internal_-1.ChecklistContextProps.md#addtasktochecklist)
- [changeChecklistTaskStatus](internal_-1.ChecklistContextProps.md#changechecklisttaskstatus)
- [checklistGroup](internal_-1.ChecklistContextProps.md#checklistgroup)
- [checklistsArray](internal_-1.ChecklistContextProps.md#checklistsarray)
- [deleteAllChecklists](internal_-1.ChecklistContextProps.md#deleteallchecklists)
- [deleteChecklist](internal_-1.ChecklistContextProps.md#deletechecklist)
- [error](internal_-1.ChecklistContextProps.md#error)
- [loading](internal_-1.ChecklistContextProps.md#loading)
- [removeTaskFromChecklist](internal_-1.ChecklistContextProps.md#removetaskfromchecklist)
- [reorderChecklistsPosition](internal_-1.ChecklistContextProps.md#reorderchecklistsposition)
- [reorderTaskPositions](internal_-1.ChecklistContextProps.md#reordertaskpositions)
- [resetAllChecklistTasks](internal_-1.ChecklistContextProps.md#resetallchecklisttasks)
- [updateChecklistTask](internal_-1.ChecklistContextProps.md#updatechecklisttask)
- [updateChecklistsData](internal_-1.ChecklistContextProps.md#updatechecklistsdata)

## Properties

### addNewChecklist

• **addNewChecklist**: (`id`: `string` \| `number`, `newTask?`: { `id`: `string` ; `name`: `string`  }) => `Promise`<`void`\>

#### Type declaration

▸ (`id`, `newTask?`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` \| `number` |
| `newTask?` | `Object` |
| `newTask.id` | `string` |
| `newTask.name` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/checklistsGroups/ChecklistProvider.tsx:74](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/ChecklistProvider.tsx#L74)

___

### addTaskToChecklist

• **addTaskToChecklist**: (`checklistKey`: `string`, `taskKey`: `string`, `name`: `string`) => `Promise`<`void`\>

#### Type declaration

▸ (`checklistKey`, `taskKey`, `name`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `checklistKey` | `string` |
| `taskKey` | `string` |
| `name` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/checklistsGroups/ChecklistProvider.tsx:58](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/ChecklistProvider.tsx#L58)

___

### changeChecklistTaskStatus

• **changeChecklistTaskStatus**: (`checklistKey`: `string`, `taskKey`: `string`, `newStatus`: `boolean`) => `Promise`<`void`\>

#### Type declaration

▸ (`checklistKey`, `taskKey`, `newStatus`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `checklistKey` | `string` |
| `taskKey` | `string` |
| `newStatus` | `boolean` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/checklistsGroups/ChecklistProvider.tsx:53](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/ChecklistProvider.tsx#L53)

___

### checklistGroup

• **checklistGroup**: `undefined` \| `IChecklistGroup`

#### Defined in

[src/checklistsGroups/ChecklistProvider.tsx:45](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/ChecklistProvider.tsx#L45)

___

### checklistsArray

• **checklistsArray**: `IChecklist`[]

#### Defined in

[src/checklistsGroups/ChecklistProvider.tsx:95](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/ChecklistProvider.tsx#L95)

___

### deleteAllChecklists

• **deleteAllChecklists**: () => `Promise`<`void`\>

#### Type declaration

▸ (): `Promise`<`void`\>

##### Returns

`Promise`<`void`\>

#### Defined in

[src/checklistsGroups/ChecklistProvider.tsx:94](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/ChecklistProvider.tsx#L94)

___

### deleteChecklist

• **deleteChecklist**: (`checklistKey`: `string`) => `Promise`<`void`\>

#### Type declaration

▸ (`checklistKey`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `checklistKey` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/checklistsGroups/ChecklistProvider.tsx:73](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/ChecklistProvider.tsx#L73)

___

### error

• **error**: `undefined` \| `Error`

#### Defined in

[src/checklistsGroups/ChecklistProvider.tsx:47](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/ChecklistProvider.tsx#L47)

___

### loading

• **loading**: `boolean`

#### Defined in

[src/checklistsGroups/ChecklistProvider.tsx:46](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/ChecklistProvider.tsx#L46)

___

### removeTaskFromChecklist

• **removeTaskFromChecklist**: (`checklistKey`: `string`, `taskKey`: `string`) => `Promise`<`void`\>

#### Type declaration

▸ (`checklistKey`, `taskKey`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `checklistKey` | `string` |
| `taskKey` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/checklistsGroups/ChecklistProvider.tsx:63](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/ChecklistProvider.tsx#L63)

___

### reorderChecklistsPosition

• **reorderChecklistsPosition**: (`checklistKey`: `string`, `toIndex`: `number`) => `Promise`<`void`\>

#### Type declaration

▸ (`checklistKey`, `toIndex`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `checklistKey` | `string` |
| `toIndex` | `number` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/checklistsGroups/ChecklistProvider.tsx:83](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/ChecklistProvider.tsx#L83)

___

### reorderTaskPositions

• **reorderTaskPositions**: (`checklistKey`: `string`, `taskKey`: `string`, `toIndex`: `number`) => `Promise`<`void`\>

#### Type declaration

▸ (`checklistKey`, `taskKey`, `toIndex`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `checklistKey` | `string` |
| `taskKey` | `string` |
| `toIndex` | `number` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/checklistsGroups/ChecklistProvider.tsx:67](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/ChecklistProvider.tsx#L67)

___

### resetAllChecklistTasks

• **resetAllChecklistTasks**: () => `Promise`<`void`\>

#### Type declaration

▸ (): `Promise`<`void`\>

##### Returns

`Promise`<`void`\>

#### Defined in

[src/checklistsGroups/ChecklistProvider.tsx:72](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/ChecklistProvider.tsx#L72)

___

### updateChecklistTask

• **updateChecklistTask**: (`checklistKey`: `string`, `taskKey`: `string`, `name`: `string`) => `Promise`<`void`\>

#### Type declaration

▸ (`checklistKey`, `taskKey`, `name`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `checklistKey` | `string` |
| `taskKey` | `string` |
| `name` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/checklistsGroups/ChecklistProvider.tsx:48](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/ChecklistProvider.tsx#L48)

___

### updateChecklistsData

• **updateChecklistsData**: (`checklistKey`: `string`, `newData`: `Partial`<{ `description`: `string` ; `name`: `string`  }\>) => `Promise`<`void`\>

#### Type declaration

▸ (`checklistKey`, `newData`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `checklistKey` | `string` |
| `newData` | `Partial`<{ `description`: `string` ; `name`: `string`  }\> |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/checklistsGroups/ChecklistProvider.tsx:87](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/checklistsGroups/ChecklistProvider.tsx#L87)
