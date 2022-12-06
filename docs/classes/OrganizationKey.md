[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / OrganizationKey

# Class: OrganizationKey

The Organization Key contains the necessary information about the user's role and permissions within an organization and its locations.

## Table of contents

### Constructors

- [constructor](OrganizationKey.md#constructor)

### Properties

- [keyRing](OrganizationKey.md#keyring)
- [orgId](OrganizationKey.md#orgid)
- [role](OrganizationKey.md#role)

### Methods

- [getLocationKey](OrganizationKey.md#getlocationkey)

## Constructors

### constructor

• **new OrganizationKey**(`keyData`)

Creates a new instance of the OrganizationKey class.

**`Remarks`**

Since we get the locKeys as raw objects, we need to convert them to LocationKey objects.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `keyData` | [`IOrganizationKey`](../interfaces/IOrganizationKey.md) | The organization key data. |

#### Defined in

account/OrganizationKey.ts:36

## Properties

### keyRing

• `Readonly` **keyRing**: `Map`<`string`, [`LocationKey`](LocationKey.md)\>

The keys for the different locations that the employee has access to.

#### Defined in

account/OrganizationKey.ts:28

___

### orgId

• `Readonly` **orgId**: `string`

The id of the organization.

#### Defined in

account/OrganizationKey.ts:20

___

### role

• `Readonly` **role**: [`OrganizationRole`](../modules.md#organizationrole)

The role of the employee in the organization.

#### Defined in

account/OrganizationKey.ts:24

## Methods

### getLocationKey

▸ **getLocationKey**(`locationId`): `undefined` \| [`LocationKey`](LocationKey.md)

Returns the location key for the given locationId.

#### Parameters

| Name | Type |
| :------ | :------ |
| `locationId` | `string` |

#### Returns

`undefined` \| [`LocationKey`](LocationKey.md)

#### Defined in

account/OrganizationKey.ts:50
