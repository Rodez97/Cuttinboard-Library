[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / IConversationsContextProps

# Interface: IConversationsContextProps

The `ConversationsContextProps` interface defines the shape of the
object that is passed to the `ConversationsContext` provider.

## Table of contents

### Properties

- [activeConversation](IConversationsContextProps.md#activeconversation)
- [activeConversationId](IConversationsContextProps.md#activeconversationid)
- [addConversation](IConversationsContextProps.md#addconversation)
- [allConversations](IConversationsContextProps.md#allconversations)
- [canManage](IConversationsContextProps.md#canmanage)
- [canUse](IConversationsContextProps.md#canuse)
- [error](IConversationsContextProps.md#error)
- [loading](IConversationsContextProps.md#loading)
- [modifyConversation](IConversationsContextProps.md#modifyconversation)
- [setActiveConversationId](IConversationsContextProps.md#setactiveconversationid)

## Properties

### activeConversation

• `Optional` **activeConversation**: [`Conversation`](../classes/Conversation.md)

The current active conversation.

#### Defined in

chats/Conversations.tsx:47

___

### activeConversationId

• **activeConversationId**: `string`

The ID of the current active conversation.

#### Defined in

chats/Conversations.tsx:51

___

### addConversation

• **addConversation**: (`newConvData`: `Omit`<[`IConversation`](IConversation.md), ``"locationId"``\>) => `Promise`<`string`\>

#### Type declaration

▸ (`newConvData`): `Promise`<`string`\>

A callback function that adds a new conversation with the given data.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `newConvData` | `Omit`<[`IConversation`](IConversation.md), ``"locationId"``\> | The data for the new conversation. |

##### Returns

`Promise`<`string`\>

#### Defined in

chats/Conversations.tsx:71

___

### allConversations

• `Optional` **allConversations**: [`Conversation`](../classes/Conversation.md)[]

An optional array of `Conversation` objects representing
all of the conversations available in the current location.

#### Defined in

chats/Conversations.tsx:43

___

### canManage

• **canManage**: `boolean`

A boolean value indicating whether the current user
has permission to manage conversations.

#### Defined in

chats/Conversations.tsx:61

___

### canUse

• **canUse**: `boolean`

A boolean value indicating whether the current user
has permission to use conversations.

#### Defined in

chats/Conversations.tsx:66

___

### error

• `Optional` **error**: `Error`

An optional error object that contains information about any error that may have occurred.

#### Defined in

chats/Conversations.tsx:90

___

### loading

• **loading**: `boolean`

A boolean value indicating whether the component is currently loading data.

#### Defined in

chats/Conversations.tsx:86

___

### modifyConversation

• **modifyConversation**: (`updates`: `PartialWithFieldValue`<`Pick`<[`IConversation`](IConversation.md), ``"name"`` \| ``"position"`` \| ``"description"``\>\>) => `Promise`<`void`\>

#### Type declaration

▸ (`updates`): `Promise`<`void`\>

A callback function that updates the active conversation with the given updates.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `updates` | `PartialWithFieldValue`<`Pick`<[`IConversation`](IConversation.md), ``"name"`` \| ``"position"`` \| ``"description"``\>\> | The updates to apply to the active conversation. |

##### Returns

`Promise`<`void`\>

#### Defined in

chats/Conversations.tsx:78

___

### setActiveConversationId

• **setActiveConversationId**: (`conversationId`: `string`) => `void`

#### Type declaration

▸ (`conversationId`): `void`

A callback function that sets the active conversation ID.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `conversationId` | `string` | The ID of the conversation to select. |

##### Returns

`void`

#### Defined in

chats/Conversations.tsx:56
