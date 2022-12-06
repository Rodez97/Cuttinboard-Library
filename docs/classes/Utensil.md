[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / Utensil

# Class: Utensil

A class that represents a utensil in the database.
- A utensil is a document that can be attached to a Utensils board.
- Utensils are objects that are used in the restaurant.

## Implements

- [`IUtensil`](../interfaces/IUtensil.md)
- [`PrimaryFirestore`](../modules.md#primaryfirestore)
- [`FirebaseSignature`](../modules.md#firebasesignature)

## Table of contents

### Constructors

- [constructor](Utensil.md#constructor)

### Properties

- [changes](Utensil.md#changes)
- [createdAt](Utensil.md#createdat)
- [createdBy](Utensil.md#createdby)
- [currentQuantity](Utensil.md#currentquantity)
- [description](Utensil.md#description)
- [docRef](Utensil.md#docref)
- [id](Utensil.md#id)
- [locationId](Utensil.md#locationid)
- [name](Utensil.md#name)
- [optimalQuantity](Utensil.md#optimalquantity)
- [percent](Utensil.md#percent)
- [tags](Utensil.md#tags)
- [firestoreConverter](Utensil.md#firestoreconverter)

### Accessors

- [createdAtDate](Utensil.md#createdatdate)
- [lastChange](Utensil.md#lastchange)
- [orderedChanges](Utensil.md#orderedchanges)

### Methods

- [addChange](Utensil.md#addchange)
- [delete](Utensil.md#delete)
- [update](Utensil.md#update)
- [NewUtensil](Utensil.md#newutensil)

## Constructors

### constructor

• **new Utensil**(`data`, `firestoreBase`)

Create a new utensil instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`IUtensil`](../interfaces/IUtensil.md) & [`FirebaseSignature`](../modules.md#firebasesignature)<`Timestamp`\> | Data to create a new utensil class instance. |
| `firestoreBase` | [`PrimaryFirestore`](../modules.md#primaryfirestore) | The id and document reference of the document. |

#### Defined in

utensils/Utensil.ts:153

## Properties

### changes

• `Optional` `Readonly` **changes**: [`UtensilChange`](../modules.md#utensilchange)[]

List of the 50 most recent changes to the utensil.

#### Implementation of

[IUtensil](../interfaces/IUtensil.md).[changes](../interfaces/IUtensil.md#changes)

#### Defined in

utensils/Utensil.ts:74

___

### createdAt

• `Readonly` **createdAt**: `Timestamp`

Timestamp of when the document was created.

#### Implementation of

FirebaseSignature.createdAt

#### Defined in

utensils/Utensil.ts:78

___

### createdBy

• `Readonly` **createdBy**: `string`

Id of the user that created the document.

#### Implementation of

FirebaseSignature.createdBy

#### Defined in

utensils/Utensil.ts:82

___

### currentQuantity

• `Readonly` **currentQuantity**: `number`

Current quantity of the utensil.
- The current quantity is the quantity that the restaurant currently has in stock.

#### Implementation of

[IUtensil](../interfaces/IUtensil.md).[currentQuantity](../interfaces/IUtensil.md#currentquantity)

#### Defined in

utensils/Utensil.ts:66

___

### description

• `Optional` `Readonly` **description**: `string`

Short description of the utensil.

#### Implementation of

[IUtensil](../interfaces/IUtensil.md).[description](../interfaces/IUtensil.md#description)

#### Defined in

utensils/Utensil.ts:56

___

### docRef

• `Readonly` **docRef**: `DocumentReference`<`DocumentData`\>

Document reference of the document.

#### Implementation of

PrimaryFirestore.docRef

#### Defined in

utensils/Utensil.ts:48

___

### id

• `Readonly` **id**: `string`

Id of the document.

#### Implementation of

PrimaryFirestore.id

#### Defined in

utensils/Utensil.ts:44

___

### locationId

• `Readonly` **locationId**: `string`

Id of the location that the utensil is attached to.

#### Implementation of

[IUtensil](../interfaces/IUtensil.md).[locationId](../interfaces/IUtensil.md#locationid)

#### Defined in

utensils/Utensil.ts:86

___

### name

• `Readonly` **name**: `string`

Name of the utensil.

#### Implementation of

[IUtensil](../interfaces/IUtensil.md).[name](../interfaces/IUtensil.md#name)

#### Defined in

utensils/Utensil.ts:52

___

### optimalQuantity

• `Readonly` **optimalQuantity**: `number`

Optimal quantity of the utensil.
- The optimal quantity is the quantity that the restaurant should have to be able to operate normally.

#### Implementation of

[IUtensil](../interfaces/IUtensil.md).[optimalQuantity](../interfaces/IUtensil.md#optimalquantity)

#### Defined in

utensils/Utensil.ts:61

___

### percent

• `Readonly` **percent**: `number`

Percent that te current quantity is of the optimal quantity.

#### Implementation of

[IUtensil](../interfaces/IUtensil.md).[percent](../interfaces/IUtensil.md#percent)

#### Defined in

utensils/Utensil.ts:90

___

### tags

• `Optional` `Readonly` **tags**: `string`[]

Tags used to categorize the utensil.

#### Implementation of

[IUtensil](../interfaces/IUtensil.md).[tags](../interfaces/IUtensil.md#tags)

#### Defined in

utensils/Utensil.ts:70

___

### firestoreConverter

▪ `Static` **firestoreConverter**: `Object`

Firestore Data firestoreConverter for Utensil class.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<[`IUtensil`](../interfaces/IUtensil.md) & [`FirebaseSignature`](../modules.md#firebasesignature)<`Timestamp`\>\>, `options`: `SnapshotOptions`) => [`Utensil`](Utensil.md) |
| `toFirestore` | (`object`: [`Utensil`](Utensil.md)) => `DocumentData` |

#### Defined in

utensils/Utensil.ts:95

## Accessors

### createdAtDate

• `get` **createdAtDate**(): `Date`

Creation date of the document.

#### Returns

`Date`

#### Defined in

utensils/Utensil.ts:185

___

### lastChange

• `get` **lastChange**(): [`UtensilChange`](../modules.md#utensilchange)

Get the last change made to the utensil.

#### Returns

[`UtensilChange`](../modules.md#utensilchange)

#### Defined in

utensils/Utensil.ts:199

___

### orderedChanges

• `get` **orderedChanges**(): [`UtensilChange`](../modules.md#utensilchange)[]

Get the changes of the utensil ordered by date.

#### Returns

[`UtensilChange`](../modules.md#utensilchange)[]

#### Defined in

utensils/Utensil.ts:192

## Methods

### addChange

▸ **addChange**(`quantity`, `reason?`): `Promise`<`void`\>

Update the current quantity of the utensil by adding a new change.

**`Remarks`**

Since we only store the 50 most recent changes, we need to delete the oldest change if there are more than 50 changes.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `quantity` | `number` | Quantity to add to the current quantity. (Can be negative) |
| `reason?` | `string` | Reason for the change. |

#### Returns

`Promise`<`void`\>

#### Defined in

utensils/Utensil.ts:210

___

### delete

▸ **delete**(): `Promise`<`void`\>

Delete the utensil.

#### Returns

`Promise`<`void`\>

#### Defined in

utensils/Utensil.ts:299

___

### update

▸ **update**(`updates`): `Promise`<`void`\>

Update the utensil data.

**`Remarks`**

This method will also update the percentage if the current amount or optimal amount is updated.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `updates` | `Partial`<[`IUtensil`](../interfaces/IUtensil.md)\> | Updates to make to the utensil. |

#### Returns

`Promise`<`void`\>

#### Defined in

utensils/Utensil.ts:267

___

### NewUtensil

▸ `Static` **NewUtensil**(`values`): `Promise`<`void`\>

- Create a new utensil.
- Add it to the database.
- Calculate the percent.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `values` | `Omit`<[`IUtensil`](../interfaces/IUtensil.md), ``"percent"``\> | Data to create a new utensil. |

#### Returns

`Promise`<`void`\>

#### Defined in

utensils/Utensil.ts:116
