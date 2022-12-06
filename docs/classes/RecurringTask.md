[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / RecurringTask

# Class: RecurringTask

RecurringTask is a class that represents a recurring task.

## Implements

- [`IRecurringTask`](../interfaces/IRecurringTask.md)

## Table of contents

### Constructors

- [constructor](RecurringTask.md#constructor)

### Properties

- [description](RecurringTask.md#description)
- [name](RecurringTask.md#name)
- [recurrence](RecurringTask.md#recurrence)

### Accessors

- [isToday](RecurringTask.md#istoday)
- [nextOccurrence](RecurringTask.md#nextoccurrence)
- [recurrenceRule](RecurringTask.md#recurrencerule)

### Methods

- [matchesDate](RecurringTask.md#matchesdate)
- [getRRuleFromObject](RecurringTask.md#getrrulefromobject)
- [getRRuleObjectFromRule](RecurringTask.md#getrruleobjectfromrule)

## Constructors

### constructor

• **new RecurringTask**(`data`)

Creates a new RecurringTask class instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`IRecurringTask`](../interfaces/IRecurringTask.md) | RecurringTask data |

#### Defined in

checklist/RecurringTask.ts:47

## Properties

### description

• `Optional` `Readonly` **description**: `string`

A short description of the task

#### Implementation of

[IRecurringTask](../interfaces/IRecurringTask.md).[description](../interfaces/IRecurringTask.md#description)

#### Defined in

checklist/RecurringTask.ts:36

___

### name

• `Readonly` **name**: `string`

The name or content of the task

#### Implementation of

[IRecurringTask](../interfaces/IRecurringTask.md).[name](../interfaces/IRecurringTask.md#name)

#### Defined in

checklist/RecurringTask.ts:32

___

### recurrence

• `Readonly` **recurrence**: `string`

The recurrence rule of the task as a string (RRule.toString())

**`See`**

https://jakubroztocil.github.io/rrule/

#### Implementation of

[IRecurringTask](../interfaces/IRecurringTask.md).[recurrence](../interfaces/IRecurringTask.md#recurrence)

#### Defined in

checklist/RecurringTask.ts:41

## Accessors

### isToday

• `get` **isToday**(): `boolean`

Checks if the task is due today

#### Returns

`boolean`

#### Defined in

checklist/RecurringTask.ts:149

___

### nextOccurrence

• `get` **nextOccurrence**(): `Date`

Get the next occurrence of the task

#### Returns

`Date`

#### Defined in

checklist/RecurringTask.ts:158

___

### recurrenceRule

• `get` **recurrenceRule**(): `RRule`

Returns the Recurrence Rule from this Recurring Task

#### Returns

`RRule`

#### Defined in

checklist/RecurringTask.ts:124

## Methods

### matchesDate

▸ **matchesDate**(`date`): `boolean`

Checks if a given date matches the recurrence rule

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `date` | `Date` | Date to check |

#### Returns

`boolean`

#### Defined in

checklist/RecurringTask.ts:141

___

### getRRuleFromObject

▸ `Static` **getRRuleFromObject**(`param`): `RRule`

Returns the Recurrence Rule from the Recurrence Object

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`RecurrenceObject`](../modules.md#recurrenceobject) | Recurrence Object |

#### Returns

`RRule`

#### Defined in

checklist/RecurringTask.ts:57

___

### getRRuleObjectFromRule

▸ `Static` **getRRuleObjectFromRule**(`rule`): [`RecurrenceObject`](../modules.md#recurrenceobject)

Returns a Recurrence Object from the Recurrence Rule

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rule` | `RRule` | Recurrence Rule |

#### Returns

[`RecurrenceObject`](../modules.md#recurrenceobject)

#### Defined in

checklist/RecurringTask.ts:103
