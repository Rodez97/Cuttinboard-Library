[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / IDirectMessageChatContext

# Interface: IDirectMessageChatContext

The interface for the context data used by the DirectMessage component.

## Table of contents

### Properties

- [directMessageChats](IDirectMessageChatContext.md#directmessagechats)
- [error](IDirectMessageChatContext.md#error)
- [isLoading](IDirectMessageChatContext.md#isloading)
- [selectedDirectMessageChat](IDirectMessageChatContext.md#selecteddirectmessagechat)
- [selectedDirectMessageChatId](IDirectMessageChatContext.md#selecteddirectmessagechatid)
- [setSelectedDirectMessageChatId](IDirectMessageChatContext.md#setselecteddirectmessagechatid)
- [startNewDirectMessageChat](IDirectMessageChatContext.md#startnewdirectmessagechat)

## Properties

### directMessageChats

• `Optional` **directMessageChats**: [`Chat`](../classes/Chat.md)[]

The list of direct message chats that the current user is a member of.

#### Defined in

chats/DirectMessageChatProvider.tsx:31

___

### error

• `Optional` **error**: `Error`

Indicates whether an error occurred while loading the context data.

#### Defined in

chats/DirectMessageChatProvider.tsx:66

___

### isLoading

• **isLoading**: `boolean`

Indicates whether the context data is currently being loaded.

#### Defined in

chats/DirectMessageChatProvider.tsx:61

___

### selectedDirectMessageChat

• `Optional` **selectedDirectMessageChat**: [`Chat`](../classes/Chat.md)

The currently selected direct message chat.

#### Defined in

chats/DirectMessageChatProvider.tsx:36

___

### selectedDirectMessageChatId

• **selectedDirectMessageChatId**: `string`

The ID of the currently selected direct message chat.

#### Defined in

chats/DirectMessageChatProvider.tsx:41

___

### setSelectedDirectMessageChatId

• **setSelectedDirectMessageChatId**: (`chatId`: `string`) => `void`

#### Type declaration

▸ (`chatId`): `void`

A function that sets the ID of the currently selected direct message chat.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `chatId` | `string` | The ID of the direct message chat to set as the selected chat. |

##### Returns

`void`

#### Defined in

chats/DirectMessageChatProvider.tsx:47

___

### startNewDirectMessageChat

• **startNewDirectMessageChat**: (`recipient`: [`CuttinboardUser`](../classes/CuttinboardUser.md) \| [`Employee`](../classes/Employee.md)) => `Promise`<`string`\>

#### Type declaration

▸ (`recipient`): `Promise`<`string`\>

A function that starts a new direct message with the specified user.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `recipient` | [`CuttinboardUser`](../classes/CuttinboardUser.md) \| [`Employee`](../classes/Employee.md) | The recipient of the direct message. |

##### Returns

`Promise`<`string`\>

The ID of the new direct message chat.

#### Defined in

chats/DirectMessageChatProvider.tsx:54
