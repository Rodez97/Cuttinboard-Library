[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / Notifications

# Class: Notifications

Represents the notifications data of a user.

## Implements

- [`INotifications`](../interfaces/INotifications.md)

## Table of contents

### Constructors

- [constructor](Notifications.md#constructor)

### Properties

- [dm](Notifications.md#dm)
- [organizations](Notifications.md#organizations)

### Accessors

- [allDMBadges](Notifications.md#alldmbadges)

### Methods

- [getAllBadgesByLocation](Notifications.md#getallbadgesbylocation)
- [getAllConversationBadges](Notifications.md#getallconversationbadges)
- [getConversationBadges](Notifications.md#getconversationbadges)
- [getDMBadge](Notifications.md#getdmbadge)
- [getScheduleBadges](Notifications.md#getschedulebadges)
- [haveNotificationsInOtherLocations](Notifications.md#havenotificationsinotherlocations)
- [removeConversationBadges](Notifications.md#removeconversationbadges)
- [removeDMBadge](Notifications.md#removedmbadge)
- [removeScheduleBadges](Notifications.md#removeschedulebadges)

## Constructors

### constructor

• **new Notifications**(`props?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props?` | `Partial`<[`INotifications`](../interfaces/INotifications.md)\> |

#### Defined in

user_metadata/Notifications.ts:77

## Properties

### dm

• `Optional` `Readonly` **dm**: `Object`

Direct message notifications.
The keys of this object represent the IDs of the direct messages,
and the values represent the number of unread notifications for each direct message.

#### Index signature

▪ [dmId: `string`]: `number`

#### Implementation of

[INotifications](../interfaces/INotifications.md).[dm](../interfaces/INotifications.md#dm)

#### Defined in

user_metadata/Notifications.ts:53

___

### organizations

• `Optional` `Readonly` **organizations**: `Object`

Organization-related notifications.
The keys of this object represent the IDs of the organizations,
and the values are objects containing the notifications data for each organization.

#### Index signature

▪ [organizationId: `string`]: { `locations?`: { `[locationId: string]`: { `conv?`: { `[convId: string]`: `number`;  } ; `sch?`: `number`  };  }  }

#### Implementation of

[INotifications](../interfaces/INotifications.md).[organizations](../interfaces/INotifications.md#organizations)

#### Defined in

user_metadata/Notifications.ts:57

## Accessors

### allDMBadges

• `get` **allDMBadges**(): `number`

Calculates the total number of badges (notifications) for all the user's direct messages (DMs)

#### Returns

`number`

#### Defined in

user_metadata/Notifications.ts:85

## Methods

### getAllBadgesByLocation

▸ **getAllBadgesByLocation**(`organizationId`, `locationId`): `number`

Calculates the total number of badges (notifications) for a specific location in an organization.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `organizationId` | `string` | The ID of the organization |
| `locationId` | `string` | The ID of the location |

#### Returns

`number`

#### Defined in

user_metadata/Notifications.ts:156

___

### getAllConversationBadges

▸ **getAllConversationBadges**(`organizationId`, `locationId`): `number`

Gets the total number of conversation badges for the specified location.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `organizationId` | `string` | The ID of the organization. |
| `locationId` | `string` | The ID of the location. |

#### Returns

`number`

The total number of conversation badges for the specified location.

#### Defined in

user_metadata/Notifications.ts:373

___

### getConversationBadges

▸ **getConversationBadges**(`organizationId`, `locationId`, `convId`): `number`

Returns the number of conversation badges for a specific organization and location.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `organizationId` | `string` | The ID of the organization |
| `locationId` | `string` | The ID of the location |
| `convId` | `string` | The ID of the conversation |

#### Returns

`number`

#### Defined in

user_metadata/Notifications.ts:302

___

### getDMBadge

▸ **getDMBadge**(`dmId`): `number`

Retrieves the number of badges (notifications) for a specific direct message (DM) based on its ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `dmId` | `string` | The ID of the DM |

#### Returns

`number`

The number of badges (notifications) for the DM

#### Defined in

user_metadata/Notifications.ts:106

___

### getScheduleBadges

▸ **getScheduleBadges**(`organizationId`, `locationId`): `number`

Returns the number of schedule badges for a specified organization and location.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `organizationId` | `string` | The ID of the organization |
| `locationId` | `string` | The ID of the location |

#### Returns

`number`

#### Defined in

user_metadata/Notifications.ts:246

___

### haveNotificationsInOtherLocations

▸ **haveNotificationsInOtherLocations**(`organizationId`, `locationId`): `boolean`

Checks if an organization has any locations with notifications (badges) other than the specified location.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `organizationId` | `string` | The ID of the organization |
| `locationId` | `string` | The ID of the location |

#### Returns

`boolean`

#### Defined in

user_metadata/Notifications.ts:203

___

### removeConversationBadges

▸ **removeConversationBadges**(`organizationId`, `locationId`, `convId`): `Promise`<`void`\>

Removes the for a specific organization, location, and conversation.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `organizationId` | `string` | The ID of the organization |
| `locationId` | `string` | The ID of the location |
| `convId` | `string` | The ID of the conversation |

#### Returns

`Promise`<`void`\>

#### Defined in

user_metadata/Notifications.ts:333

___

### removeDMBadge

▸ **removeDMBadge**(`dmId`): `Promise`<`void`\>

Removes a badge (notification) for a specific direct message (DM) based on its ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `dmId` | `string` | The ID of the DM |

#### Returns

`Promise`<`void`\>

#### Defined in

user_metadata/Notifications.ts:125

___

### removeScheduleBadges

▸ **removeScheduleBadges**(`organizationId`, `locationId`): `Promise`<`void`\>

Removes a schedule badge for a specific organization and location.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `organizationId` | `string` | The ID of the organization |
| `locationId` | `string` | The ID of the location |

#### Returns

`Promise`<`void`\>

#### Defined in

user_metadata/Notifications.ts:269
