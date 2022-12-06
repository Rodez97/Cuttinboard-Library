[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / LocationKey

# Class: LocationKey

The key for a specific location.

## Table of contents

### Constructors

- [constructor](LocationKey.md#constructor)

### Properties

- [locId](LocationKey.md#locid)
- [pos](LocationKey.md#pos)
- [role](LocationKey.md#role)

## Constructors

### constructor

• **new LocationKey**(`keyData`)

Creates a new instance of the LocationKey class.

**`Remarks`**

The positions are in the form of an array of strings,
but we get them from the organizationKey as a JSON string,
so we need to parse them.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `keyData` | [`ILocationKey`](../interfaces/ILocationKey.md) | The location key data. |

#### Defined in

account/LocationKey.ts:37

## Properties

### locId

• `Readonly` **locId**: `string`

The id of the location.

#### Defined in

account/LocationKey.ts:19

___

### pos

• `Optional` `Readonly` **pos**: `string`[]

The positions of the employee in the location.

#### Defined in

account/LocationKey.ts:27

___

### role

• `Readonly` **role**: [`RoleAccessLevels`](../enums/RoleAccessLevels.md)

The role of the employee in the location.

#### Defined in

account/LocationKey.ts:23
