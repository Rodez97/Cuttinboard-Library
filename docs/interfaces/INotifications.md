[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / INotifications

# Interface: INotifications

Represents the notifications data of a user.

## Implemented by

- [`Notifications`](../classes/Notifications.md)

## Table of contents

### Properties

- [dm](INotifications.md#dm)
- [organizations](INotifications.md#organizations)

## Properties

### dm

• `Optional` **dm**: `Object`

Direct message notifications.
The keys of this object represent the IDs of the direct messages,
and the values represent the number of unread notifications for each direct message.

#### Index signature

▪ [dmId: `string`]: `number`

#### Defined in

user_metadata/Notifications.ts:14

___

### organizations

• `Optional` **organizations**: `Object`

Organization-related notifications.
The keys of this object represent the IDs of the organizations,
and the values are objects containing the notifications data for each organization.

#### Index signature

▪ [organizationId: `string`]: { `locations?`: { `[locationId: string]`: { `conv?`: { `[convId: string]`: `number`;  } ; `sch?`: `number`  };  }  }

#### Defined in

user_metadata/Notifications.ts:22
