[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / IConversationsContextProps

# Interface: IConversationsContextProps

The `ConversationsContextProps` interface defines the shape of the
object that is passed to the `ConversationsContext` provider.

## Table of contents

### Properties

- [activeConversation](IConversationsContextProps.md#activeconversation)
- [addConversation](IConversationsContextProps.md#addconversation)
- [addMembers](IConversationsContextProps.md#addmembers)
- [canManage](IConversationsContextProps.md#canmanage)
- [canUse](IConversationsContextProps.md#canuse)
- [conversations](IConversationsContextProps.md#conversations)
- [deleteConversation](IConversationsContextProps.md#deleteconversation)
- [error](IConversationsContextProps.md#error)
- [loading](IConversationsContextProps.md#loading)
- [removeMembers](IConversationsContextProps.md#removemembers)
- [selectConversationId](IConversationsContextProps.md#selectconversationid)
- [toggleConversationMuted](IConversationsContextProps.md#toggleconversationmuted)
- [updateConversation](IConversationsContextProps.md#updateconversation)

## Properties

### activeConversation

• **activeConversation**: `undefined` \| `IConversation`

The current active conversation.

#### Defined in

[src/conversations/ConversationsProvider.tsx:46](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/ConversationsProvider.tsx#L46)

___

### addConversation

• **addConversation**: (`newConvData`: { `description?`: `string` ; `name`: `string` ; `position?`: `string` ; `privacyLevel`: `PrivacyLevel`  }, `location`: `ILocation`, `employees`: `IEmployee`[], `privateInitialMembers?`: `IEmployee`[]) => `Promise`<`void`\>

#### Type declaration

▸ (`newConvData`, `location`, `employees`, `privateInitialMembers?`): `Promise`<`void`\>

A callback function that adds a new conversation with the given data.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `newConvData` | `Object` | The data for the new conversation. |
| `newConvData.description?` | `string` | - |
| `newConvData.name` | `string` | - |
| `newConvData.position?` | `string` | - |
| `newConvData.privacyLevel` | `PrivacyLevel` | - |
| `location` | `ILocation` | - |
| `employees` | `IEmployee`[] | - |
| `privateInitialMembers?` | `IEmployee`[] | - |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/conversations/ConversationsProvider.tsx:61](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/ConversationsProvider.tsx#L61)

___

### addMembers

• **addMembers**: (`conversation`: `IConversation`, `newMembers`: `IEmployee`[]) => `Promise`<`void`\>

#### Type declaration

▸ (`conversation`, `newMembers`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `conversation` | `IConversation` |
| `newMembers` | `IEmployee`[] |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/conversations/ConversationsProvider.tsx:73](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/ConversationsProvider.tsx#L73)

___

### canManage

• **canManage**: `boolean`

A boolean value indicating whether the current user
has permission to manage conversations.

#### Defined in

[src/conversations/ConversationsProvider.tsx:51](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/ConversationsProvider.tsx#L51)

___

### canUse

• **canUse**: `boolean`

A boolean value indicating whether the current user
has permission to use conversations.

#### Defined in

[src/conversations/ConversationsProvider.tsx:56](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/ConversationsProvider.tsx#L56)

___

### conversations

• **conversations**: `IConversation`[]

An optional array of `Conversation` objects representing
all of the conversations available in the current location.

#### Defined in

[src/conversations/ConversationsProvider.tsx:42](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/ConversationsProvider.tsx#L42)

___

### deleteConversation

• **deleteConversation**: (`conversation`: `IConversation`) => `Promise`<`void`\>

#### Type declaration

▸ (`conversation`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `conversation` | `IConversation` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/conversations/ConversationsProvider.tsx:88](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/ConversationsProvider.tsx#L88)

___

### error

• **error**: `undefined` \| `Error`

#### Defined in

[src/conversations/ConversationsProvider.tsx:91](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/ConversationsProvider.tsx#L91)

___

### loading

• **loading**: `boolean`

#### Defined in

[src/conversations/ConversationsProvider.tsx:90](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/ConversationsProvider.tsx#L90)

___

### removeMembers

• **removeMembers**: (`conversation`: `IConversation`, `membersToRemove`: `IEmployee`[]) => `Promise`<`void`\>

#### Type declaration

▸ (`conversation`, `membersToRemove`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `conversation` | `IConversation` |
| `membersToRemove` | `IEmployee`[] |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/conversations/ConversationsProvider.tsx:77](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/ConversationsProvider.tsx#L77)

___

### selectConversationId

• **selectConversationId**: (`conversationId`: `string`) => `void`

#### Type declaration

▸ (`conversationId`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `conversationId` | `string` |

##### Returns

`void`

#### Defined in

[src/conversations/ConversationsProvider.tsx:89](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/ConversationsProvider.tsx#L89)

___

### toggleConversationMuted

• **toggleConversationMuted**: (`conversation`: `IConversation`) => `Promise`<`void`\>

#### Type declaration

▸ (`conversation`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `conversation` | `IConversation` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/conversations/ConversationsProvider.tsx:72](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/ConversationsProvider.tsx#L72)

___

### updateConversation

• **updateConversation**: (`conversation`: `IConversation`, `conversationUpdates`: { `description?`: `string` ; `name?`: `string`  }) => `Promise`<`void`\>

#### Type declaration

▸ (`conversation`, `conversationUpdates`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `conversation` | `IConversation` |
| `conversationUpdates` | `Object` |
| `conversationUpdates.description?` | `string` |
| `conversationUpdates.name?` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/conversations/ConversationsProvider.tsx:81](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/ConversationsProvider.tsx#L81)
