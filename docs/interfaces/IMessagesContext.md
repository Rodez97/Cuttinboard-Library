[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / IMessagesContext

# Interface: IMessagesContext

The props for the Direct Messages context.

## Table of contents

### Properties

- [allMessages](IMessagesContext.md#allmessages)
- [error](IMessagesContext.md#error)
- [fetchPreviousMessages](IMessagesContext.md#fetchpreviousmessages)
- [getAttachmentFilePath](IMessagesContext.md#getattachmentfilepath)
- [hasNoMoreMessages](IMessagesContext.md#hasnomoremessages)
- [isLoading](IMessagesContext.md#isloading)
- [submitMessage](IMessagesContext.md#submitmessage)

## Properties

### allMessages

• `Optional` **allMessages**: [`Message`](../classes/Message.md)[]

An array of `Message` objects representing all of the messages in the current conversation.

#### Defined in

chats/MessagesProvider.tsx:17

___

### error

• `Optional` **error**: `Error`

An optional error that occurred during a previous operation in the context.

#### Defined in

chats/MessagesProvider.tsx:41

___

### fetchPreviousMessages

• **fetchPreviousMessages**: () => `Promise`<`void`\>

#### Type declaration

▸ (): `Promise`<`void`\>

A function that fetches previous messages from the current conversation.

##### Returns

`Promise`<`void`\>

#### Defined in

chats/MessagesProvider.tsx:13

___

### getAttachmentFilePath

• **getAttachmentFilePath**: (`fileName`: `string`) => `string`

#### Type declaration

▸ (`fileName`): `string`

A function that returns the file path for a given attachment file name.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fileName` | `string` | The name of the attachment file. |

##### Returns

`string`

The file path for the attachment.

#### Defined in

chats/MessagesProvider.tsx:47

___

### hasNoMoreMessages

• **hasNoMoreMessages**: `boolean`

A boolean indicating whether there are no more messages to fetch in the current conversation.

#### Defined in

chats/MessagesProvider.tsx:21

___

### isLoading

• **isLoading**: `boolean`

A boolean indicating whether the context is currently loading data.

#### Defined in

chats/MessagesProvider.tsx:37

___

### submitMessage

• **submitMessage**: (`messageText`: `string`, `replyTargetMessage`: ``null`` \| [`Message`](../classes/Message.md), `attachment?`: [`Attachment`](../modules.md#attachment)) => `Promise`<`void`\>

#### Type declaration

▸ (`messageText`, `replyTargetMessage`, `attachment?`): `Promise`<`void`\>

A function that submits a new message to the current conversation.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `messageText` | `string` | The text of the message. |
| `replyTargetMessage` | ``null`` \| [`Message`](../classes/Message.md) | The message that the new message is replying to, or null if it is not a reply. |
| `attachment?` | [`Attachment`](../modules.md#attachment) | An optional attachment for the message. |

##### Returns

`Promise`<`void`\>

A promise that resolves when the message has been submitted.

#### Defined in

chats/MessagesProvider.tsx:29
