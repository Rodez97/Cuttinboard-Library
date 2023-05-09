[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / IMessagesContext

# Interface: IMessagesContext

The props for the Direct Messages context.

## Table of contents

### Properties

- [error](IMessagesContext.md#error)
- [fetchPreviousMessages](IMessagesContext.md#fetchpreviousmessages)
- [getAttachmentFilePath](IMessagesContext.md#getattachmentfilepath)
- [loading](IMessagesContext.md#loading)
- [messages](IMessagesContext.md#messages)
- [noMoreMessages](IMessagesContext.md#nomoremessages)
- [removeMessage](IMessagesContext.md#removemessage)
- [submitMessage](IMessagesContext.md#submitmessage)

## Properties

### error

• `Optional` **error**: `FirestoreError`

#### Defined in

[src/messages/MessagesProvider.tsx:37](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/messages/MessagesProvider.tsx#L37)

___

### fetchPreviousMessages

• **fetchPreviousMessages**: () => `Promise`<`void`\>

#### Type declaration

▸ (): `Promise`<`void`\>

##### Returns

`Promise`<`void`\>

#### Defined in

[src/messages/MessagesProvider.tsx:31](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/messages/MessagesProvider.tsx#L31)

___

### getAttachmentFilePath

• **getAttachmentFilePath**: (`fileName`: `string`) => `string`

#### Type declaration

▸ (`fileName`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `fileName` | `string` |

##### Returns

`string`

#### Defined in

[src/messages/MessagesProvider.tsx:35](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/messages/MessagesProvider.tsx#L35)

___

### loading

• **loading**: `boolean`

#### Defined in

[src/messages/MessagesProvider.tsx:38](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/messages/MessagesProvider.tsx#L38)

___

### messages

• **messages**: `IMessage`[]

#### Defined in

[src/messages/MessagesProvider.tsx:32](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/messages/MessagesProvider.tsx#L32)

___

### noMoreMessages

• **noMoreMessages**: `boolean`

#### Defined in

[src/messages/MessagesProvider.tsx:33](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/messages/MessagesProvider.tsx#L33)

___

### removeMessage

• **removeMessage**: (`message`: `IMessage`) => `Promise`<`void`\>

#### Type declaration

▸ (`message`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `IMessage` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/messages/MessagesProvider.tsx:36](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/messages/MessagesProvider.tsx#L36)

___

### submitMessage

• **submitMessage**: (`props`: [`SubmitMessageParams`](../modules.md#submitmessageparams)) => `Promise`<`void`\>

#### Type declaration

▸ (`props`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`SubmitMessageParams`](../modules.md#submitmessageparams) |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/messages/MessagesProvider.tsx:34](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/messages/MessagesProvider.tsx#L34)
