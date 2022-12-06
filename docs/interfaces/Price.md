[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / Price

# Interface: Price

## Indexable

▪ [propName: `string`]: `unknown`

## Table of contents

### Properties

- [active](Price.md#active)
- [currency](Price.md#currency)
- [description](Price.md#description)
- [interval](Price.md#interval)
- [interval\_count](Price.md#interval_count)
- [trial\_period\_days](Price.md#trial_period_days)
- [type](Price.md#type)
- [unit\_amount](Price.md#unit_amount)

## Properties

### active

• **active**: `boolean`

Whether the price can be used for new purchases.

#### Defined in

billing/Price.ts:5

___

### currency

• **currency**: `string`

#### Defined in

billing/Price.ts:6

___

### description

• **description**: ``null`` \| `string`

A brief description of the price.

#### Defined in

billing/Price.ts:11

___

### interval

• **interval**: ``null`` \| ``"day"`` \| ``"month"`` \| ``"year"`` \| ``"week"``

The frequency at which a subscription is billed. One of `day`, `week`, `month` or `year`.

#### Defined in

billing/Price.ts:19

___

### interval\_count

• **interval\_count**: ``null`` \| `number`

The number of intervals (specified in the `interval` attribute) between subscription billings. For example, `interval=month` and `interval_count=3` bills every 3 months.

#### Defined in

billing/Price.ts:23

___

### trial\_period\_days

• **trial\_period\_days**: ``null`` \| `number`

Default number of trial days when subscribing a customer to this price using [`trial_from_plan=true`](https://stripe.com/docs/api#create_subscription-trial_from_plan).

#### Defined in

billing/Price.ts:27

___

### type

• **type**: ``"one_time"`` \| ``"recurring"``

One of `one_time` or `recurring` depending on whether the price is for a one-time purchase or a recurring (subscription) purchase.

#### Defined in

billing/Price.ts:15

___

### unit\_amount

• **unit\_amount**: `number`

#### Defined in

billing/Price.ts:7
