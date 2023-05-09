[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / [<internal\>](../modules/internal_-6.md) / RecurringTasksContextProps

# Interface: RecurringTasksContextProps

[<internal>](../modules/internal_-6.md).RecurringTasksContextProps

## Table of contents

### Properties

- [addRecurringTask](internal_-6.RecurringTasksContextProps.md#addrecurringtask)
- [completeRecurringTask](internal_-6.RecurringTasksContextProps.md#completerecurringtask)
- [error](internal_-6.RecurringTasksContextProps.md#error)
- [loading](internal_-6.RecurringTasksContextProps.md#loading)
- [recurringTaskDoc](internal_-6.RecurringTasksContextProps.md#recurringtaskdoc)
- [removeRecurringTask](internal_-6.RecurringTasksContextProps.md#removerecurringtask)
- [updateRecurringTask](internal_-6.RecurringTasksContextProps.md#updaterecurringtask)

## Properties

### addRecurringTask

• **addRecurringTask**: (`task`: `IRecurringTask`) => `Promise`<`void`\>

#### Type declaration

▸ (`task`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `task` | `IRecurringTask` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/recurringTasks/RecurringTasksProvider.tsx:33](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/recurringTasks/RecurringTasksProvider.tsx#L33)

___

### completeRecurringTask

• **completeRecurringTask**: (`id`: `string`) => `Promise`<`void`\>

#### Type declaration

▸ (`id`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/recurringTasks/RecurringTasksProvider.tsx:36](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/recurringTasks/RecurringTasksProvider.tsx#L36)

___

### error

• **error**: `undefined` \| `Error`

#### Defined in

[src/recurringTasks/RecurringTasksProvider.tsx:32](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/recurringTasks/RecurringTasksProvider.tsx#L32)

___

### loading

• **loading**: `boolean`

#### Defined in

[src/recurringTasks/RecurringTasksProvider.tsx:31](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/recurringTasks/RecurringTasksProvider.tsx#L31)

___

### recurringTaskDoc

• **recurringTaskDoc**: `undefined` \| `IRecurringTaskDoc`

#### Defined in

[src/recurringTasks/RecurringTasksProvider.tsx:30](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/recurringTasks/RecurringTasksProvider.tsx#L30)

___

### removeRecurringTask

• **removeRecurringTask**: (`id`: `string`) => `Promise`<`void`\>

#### Type declaration

▸ (`id`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/recurringTasks/RecurringTasksProvider.tsx:34](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/recurringTasks/RecurringTasksProvider.tsx#L34)

___

### updateRecurringTask

• **updateRecurringTask**: (`task`: `IRecurringTask`, `id`: `string`) => `Promise`<`void`\>

#### Type declaration

▸ (`task`, `id`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `task` | `IRecurringTask` |
| `id` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/recurringTasks/RecurringTasksProvider.tsx:35](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/recurringTasks/RecurringTasksProvider.tsx#L35)
