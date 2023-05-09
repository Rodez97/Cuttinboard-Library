[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / ICuttinboardContext

# Interface: ICuttinboardContext

## Table of contents

### Properties

- [error](ICuttinboardContext.md#error)
- [loading](ICuttinboardContext.md#loading)
- [notifications](ICuttinboardContext.md#notifications)
- [onError](ICuttinboardContext.md#onerror)
- [organizationKey](ICuttinboardContext.md#organizationkey)
- [selectLocationKey](ICuttinboardContext.md#selectlocationkey)
- [user](ICuttinboardContext.md#user)

## Properties

### error

• **error**: `undefined` \| `Error`

#### Defined in

[src/cuttinboard/CuttinboardProvider.tsx:20](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboard/CuttinboardProvider.tsx#L20)

___

### loading

• **loading**: `boolean`

#### Defined in

[src/cuttinboard/CuttinboardProvider.tsx:19](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboard/CuttinboardProvider.tsx#L19)

___

### notifications

• `Optional` **notifications**: `INotifications`

#### Defined in

[src/cuttinboard/CuttinboardProvider.tsx:21](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboard/CuttinboardProvider.tsx#L21)

___

### onError

• **onError**: (`error`: `Error`) => `void`

#### Type declaration

▸ (`error`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `Error` |

##### Returns

`void`

#### Defined in

[src/cuttinboard/CuttinboardProvider.tsx:18](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboard/CuttinboardProvider.tsx#L18)

___

### organizationKey

• **organizationKey**: `undefined` \| `IOrganizationKey`

#### Defined in

[src/cuttinboard/CuttinboardProvider.tsx:13](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboard/CuttinboardProvider.tsx#L13)

___

### selectLocationKey

• **selectLocationKey**: (`organizationId`: `string`, `locationId`: `string`) => `Promise`<`void`\>

#### Type declaration

▸ (`organizationId`, `locationId`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `organizationId` | `string` |
| `locationId` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/cuttinboard/CuttinboardProvider.tsx:14](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboard/CuttinboardProvider.tsx#L14)

___

### user

• **user**: `undefined` \| ``null`` \| `User`

#### Defined in

[src/cuttinboard/CuttinboardProvider.tsx:12](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboard/CuttinboardProvider.tsx#L12)
