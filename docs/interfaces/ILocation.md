[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / ILocation

# Interface: ILocation

The interface implemented by Location classes.

## Implemented by

- [`Location`](../classes/Location.md)

## Table of contents

### Properties

- [address](ILocation.md#address)
- [description](ILocation.md#description)
- [email](ILocation.md#email)
- [intId](ILocation.md#intid)
- [limits](ILocation.md#limits)
- [members](ILocation.md#members)
- [name](ILocation.md#name)
- [organizationId](ILocation.md#organizationid)
- [phoneNumber](ILocation.md#phonenumber)
- [settings](ILocation.md#settings)
- [storageUsed](ILocation.md#storageused)
- [subItemId](ILocation.md#subitemid)
- [subscriptionId](ILocation.md#subscriptionid)
- [subscriptionStatus](ILocation.md#subscriptionstatus)
- [supervisors](ILocation.md#supervisors)

## Properties

### address

• `Optional` **address**: `Partial`<{ `city`: `string` ; `country`: `string` ; `state`: `string` ; `street`: `string` ; `streetNumber`: `string` ; `zip`: `string` \| `number`  }\>

#### Defined in

[models/Location.ts:28](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L28)

___

### description

• `Optional` **description**: `string`

#### Defined in

[models/Location.ts:27](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L27)

___

### email

• `Optional` **email**: `string`

#### Defined in

[models/Location.ts:36](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L36)

___

### intId

• `Optional` **intId**: `string`

#### Defined in

[models/Location.ts:38](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L38)

___

### limits

• **limits**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `employees` | `number` |
| `storage` | `string` |

#### Defined in

[models/Location.ts:48](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L48)

___

### members

• **members**: `string`[]

#### Defined in

[models/Location.ts:55](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L55)

___

### name

• **name**: `string`

#### Defined in

[models/Location.ts:26](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L26)

___

### organizationId

• **organizationId**: `string`

#### Defined in

[models/Location.ts:52](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L52)

___

### phoneNumber

• `Optional` **phoneNumber**: `string`

#### Defined in

[models/Location.ts:37](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L37)

___

### settings

• `Optional` **settings**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `positions?` | `string`[] |

#### Defined in

[models/Location.ts:57](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L57)

___

### storageUsed

• **storageUsed**: `number`

#### Defined in

[models/Location.ts:47](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L47)

___

### subItemId

• **subItemId**: `string`

#### Defined in

[models/Location.ts:54](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L54)

___

### subscriptionId

• **subscriptionId**: `string`

#### Defined in

[models/Location.ts:53](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L53)

___

### subscriptionStatus

• **subscriptionStatus**: ``"active"`` \| ``"canceled"`` \| ``"incomplete"`` \| ``"incomplete_expired"`` \| ``"past_due"`` \| ``"trialing"`` \| ``"unpaid"``

#### Defined in

[models/Location.ts:39](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L39)

___

### supervisors

• `Optional` **supervisors**: `string`[]

#### Defined in

[models/Location.ts:56](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L56)
