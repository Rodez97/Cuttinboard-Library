[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / Subscription

# Interface: Subscription

## Table of contents

### Properties

- [cancel\_at](Subscription.md#cancel_at)
- [cancel\_at\_period\_end](Subscription.md#cancel_at_period_end)
- [canceled\_at](Subscription.md#canceled_at)
- [created](Subscription.md#created)
- [current\_period\_end](Subscription.md#current_period_end)
- [current\_period\_start](Subscription.md#current_period_start)
- [ended\_at](Subscription.md#ended_at)
- [items](Subscription.md#items)
- [metadata](Subscription.md#metadata)
- [price](Subscription.md#price)
- [prices](Subscription.md#prices)
- [product](Subscription.md#product)
- [quantity](Subscription.md#quantity)
- [role](Subscription.md#role)
- [status](Subscription.md#status)
- [stripeLink](Subscription.md#stripelink)
- [trial\_end](Subscription.md#trial_end)
- [trial\_start](Subscription.md#trial_start)

## Properties

### cancel\_at

• **cancel\_at**: ``null`` \| `Timestamp`

A date in the future at which the subscription will automatically get canceled.

#### Defined in

billing/Subscription.ts:67

___

### cancel\_at\_period\_end

• **cancel\_at\_period\_end**: `boolean`

If true the subscription has been canceled by the user and will be deleted at the end of the billing period.

#### Defined in

billing/Subscription.ts:47

___

### canceled\_at

• **canceled\_at**: ``null`` \| `Timestamp`

If the subscription has been canceled, the date of that cancellation. If the subscription was canceled with `cancel_at_period_end`, `canceled_at` will still reflect the date of the initial cancellation request, not the end of the subscription period when the subscription is automatically moved to a canceled state.

#### Defined in

billing/Subscription.ts:71

___

### created

• **created**: `Timestamp`

Time at which the object was created.

#### Defined in

billing/Subscription.ts:51

___

### current\_period\_end

• **current\_period\_end**: `Timestamp`

End of the current period that the subscription has been invoiced for. At the end of this period, a new invoice will be created.

#### Defined in

billing/Subscription.ts:59

___

### current\_period\_start

• **current\_period\_start**: `Timestamp`

Start of the current period that the subscription has been invoiced for.

#### Defined in

billing/Subscription.ts:55

___

### ended\_at

• **ended\_at**: ``null`` \| `Timestamp`

If the subscription has ended, the timestamp of the date the subscription ended.

#### Defined in

billing/Subscription.ts:63

___

### items

• **items**: [`SubscriptionItem`](SubscriptionItem.md)[]

#### Defined in

billing/Subscription.ts:19

___

### metadata

• **metadata**: `Object`

Set of key-value pairs that you can attach to an object.
This can be useful for storing additional information about the object in a structured format.

#### Index signature

▪ [name: `string`]: `string`

#### Defined in

billing/Subscription.ts:13

___

### price

• **price**: `DocumentReference`<`DocumentData`\>

Firestore reference to the price for this Subscription.

#### Defined in

billing/Subscription.ts:27

___

### prices

• **prices**: `DocumentReference`<`DocumentData`\>[]

Array of price references. If you provide multiple recurring prices to the checkout session via the `line_items` parameter,
this array will hold the references for all recurring prices for this subscription. `price === prices[0]`.

#### Defined in

billing/Subscription.ts:32

___

### product

• **product**: `DocumentReference`<`DocumentData`\>

Firestore reference to the product doc for this Subscription.

#### Defined in

billing/Subscription.ts:23

___

### quantity

• **quantity**: `number`

#### Defined in

billing/Subscription.ts:18

___

### role

• **role**: ``null`` \| `string`

#### Defined in

billing/Subscription.ts:17

___

### status

• **status**: ``"active"`` \| ``"canceled"`` \| ``"incomplete"`` \| ``"incomplete_expired"`` \| ``"past_due"`` \| ``"trialing"`` \| ``"unpaid"``

The status of the subscription object

#### Defined in

billing/Subscription.ts:36

___

### stripeLink

• **stripeLink**: `string`

#### Defined in

billing/Subscription.ts:16

___

### trial\_end

• **trial\_end**: ``null`` \| `Timestamp`

If the subscription has a trial, the end of that trial.

#### Defined in

billing/Subscription.ts:79

___

### trial\_start

• **trial\_start**: ``null`` \| `Timestamp`

If the subscription has a trial, the beginning of that trial.

#### Defined in

billing/Subscription.ts:75
