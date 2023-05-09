[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / DirectMessagesContext

# Interface: DirectMessagesContext

The interface for the context data used by the DirectMessage component.

## Table of contents

### Properties

- [directMessages](DirectMessagesContext.md#directmessages)
- [error](DirectMessagesContext.md#error)
- [loading](DirectMessagesContext.md#loading)
- [recipientUser](DirectMessagesContext.md#recipientuser)
- [selectDirectMessage](DirectMessagesContext.md#selectdirectmessage)
- [selectedDirectMessage](DirectMessagesContext.md#selecteddirectmessage)
- [startNewDirectMessageChat](DirectMessagesContext.md#startnewdirectmessagechat)
- [toggleMuteChat](DirectMessagesContext.md#togglemutechat)

## Properties

### directMessages

• **directMessages**: `IDirectMessage`[]

#### Defined in

[src/directMessages/DirectMessagesProvider.tsx:39](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/DirectMessagesProvider.tsx#L39)

___

### error

• **error**: `undefined` \| `Error`

#### Defined in

[src/directMessages/DirectMessagesProvider.tsx:41](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/DirectMessagesProvider.tsx#L41)

___

### loading

• **loading**: `boolean`

#### Defined in

[src/directMessages/DirectMessagesProvider.tsx:40](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/DirectMessagesProvider.tsx#L40)

___

### recipientUser

• **recipientUser**: `undefined` \| `Sender`

#### Defined in

[src/directMessages/DirectMessagesProvider.tsx:42](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/DirectMessagesProvider.tsx#L42)

___

### selectDirectMessage

• **selectDirectMessage**: (`dmId`: `undefined` \| `string`) => `void`

#### Type declaration

▸ (`dmId`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `dmId` | `undefined` \| `string` |

##### Returns

`void`

#### Defined in

[src/directMessages/DirectMessagesProvider.tsx:38](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/DirectMessagesProvider.tsx#L38)

___

### selectedDirectMessage

• **selectedDirectMessage**: `undefined` \| `IDirectMessage`

#### Defined in

[src/directMessages/DirectMessagesProvider.tsx:37](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/DirectMessagesProvider.tsx#L37)

___

### startNewDirectMessageChat

• **startNewDirectMessageChat**: (`recipient`: `ICuttinboardUser` \| `IEmployee`) => `Promise`<`undefined` \| `string`\>

#### Type declaration

▸ (`recipient`): `Promise`<`undefined` \| `string`\>

A function that starts a new direct message with the specified user.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `recipient` | `ICuttinboardUser` \| `IEmployee` | The recipient of the direct message. |

##### Returns

`Promise`<`undefined` \| `string`\>

The ID of the new direct message chat.

#### Defined in

[src/directMessages/DirectMessagesProvider.tsx:33](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/DirectMessagesProvider.tsx#L33)

___

### toggleMuteChat

• **toggleMuteChat**: (`dm`: `IDirectMessage`) => `Promise`<`void`\>

#### Type declaration

▸ (`dm`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `dm` | `IDirectMessage` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/directMessages/DirectMessagesProvider.tsx:36](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/directMessages/DirectMessagesProvider.tsx#L36)
