[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / IRecurringTaskDoc

# Interface: IRecurringTaskDoc

The basic interface for a RecurringTaskDoc document.

## Implemented by

- [`RecurringTaskDoc`](../classes/RecurringTaskDoc.md)

## Table of contents

### Properties

- [locationId](IRecurringTaskDoc.md#locationid)
- [signedBy](IRecurringTaskDoc.md#signedby)
- [tasks](IRecurringTaskDoc.md#tasks)

## Properties

### locationId

• **locationId**: `string`

#### Defined in

checklist/RecurringTask.ts:171

___

### signedBy

• `Optional` **signedBy**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `name` | `string` |

#### Defined in

checklist/RecurringTask.ts:167

___

### tasks

• `Optional` **tasks**: `Object`

#### Index signature

▪ [key: `string`]: [`IRecurringTask`](IRecurringTask.md)

#### Defined in

checklist/RecurringTask.ts:172
