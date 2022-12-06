[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / ICuttinboardContext

# Interface: ICuttinboardContext

The `ICuttinboardContext` interface represents the context provided by the `CuttinboardProvider` component.
It includes information about the current user and organization, as well as methods for selecting an organization location and accessing notifications.

## Table of contents

### Properties

- [notifications](ICuttinboardContext.md#notifications)
- [organizationKey](ICuttinboardContext.md#organizationkey)
- [selectOrganizationLocation](ICuttinboardContext.md#selectorganizationlocation)
- [user](ICuttinboardContext.md#user)

## Properties

### notifications

• **notifications**: [`Notifications`](../classes/Notifications.md)

The notifications for the current user.

#### Defined in

services/CuttinboardProvider.tsx:39

___

### organizationKey

• `Optional` **organizationKey**: [`OrganizationKey`](../classes/OrganizationKey.md)

The organization key for the current user, if any.

#### Defined in

services/CuttinboardProvider.tsx:29

___

### selectOrganizationLocation

• **selectOrganizationLocation**: (`organizationId`: `string`) => `Promise`<`void`\>

#### Type declaration

▸ (`organizationId`): `Promise`<`void`\>

A method for selecting an organization location for the current user.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `organizationId` | `string` | The ID of the organization to select. |

##### Returns

`Promise`<`void`\>

A promise that resolves when the organization location has been selected.

#### Defined in

services/CuttinboardProvider.tsx:35

___

### user

• **user**: `User`

The current user.

#### Defined in

services/CuttinboardProvider.tsx:25
