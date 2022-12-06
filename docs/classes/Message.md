[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / Message

# Class: Message

Chat Message

## Implements

- [`IMessage`](../modules.md#imessage)

## Table of contents

### Constructors

- [constructor](Message.md#constructor)

### Properties

- [attachment](Message.md#attachment)
- [contentType](Message.md#contenttype)
- [createdAt](Message.md#createdat)
- [id](Message.md#id)
- [locationName](Message.md#locationname)
- [message](Message.md#message)
- [messageRef](Message.md#messageref)
- [reactions](Message.md#reactions)
- [replyTarget](Message.md#replytarget)
- [seenBy](Message.md#seenby)
- [sender](Message.md#sender)
- [sourceUrl](Message.md#sourceurl)
- [systemType](Message.md#systemtype)
- [type](Message.md#type)

### Accessors

- [createdAtDate](Message.md#createdatdate)
- [haveUserReaction](Message.md#haveuserreaction)
- [toReplyData](Message.md#toreplydata)

### Methods

- [addReaction](Message.md#addreaction)
- [delete](Message.md#delete)
- [stateUpdate](Message.md#stateupdate)
- [updateLastVisitedBy](Message.md#updatelastvisitedby)

## Constructors

### constructor

• **new Message**(`messageData`, `id`, `ref`)

Creates a new Message instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `messageData` | [`IMessage`](../modules.md#imessage)<`number`\> | The message data |
| `id` | `string` | The id of the message (The key of the message in Realtime Database) |
| `ref` | `DatabaseReference` | The message reference in Realtime Database |

#### Defined in

chats/Message.ts:113

## Properties

### attachment

• **attachment**: [`Attachment`](../modules.md#attachment)

The attachment of the message (if any)

#### Implementation of

IMessage.attachment

#### Defined in

chats/Message.ts:97

___

### contentType

• **contentType**: [`MessageContentType`](../modules.md#messagecontenttype)

The content type of the message in case it is an attachment

#### Implementation of

IMessage.contentType

#### Defined in

chats/Message.ts:101

___

### createdAt

• **createdAt**: `number`

The time the message was created

#### Implementation of

IMessage.createdAt

#### Defined in

chats/Message.ts:49

___

### id

• `Readonly` **id**: `string`

The Id of the message

#### Defined in

chats/Message.ts:37

___

### locationName

• **locationName**: `string`

The name of the location
- This property is only used for notification purposes

#### Implementation of

IMessage.locationName

#### Defined in

chats/Message.ts:81

___

### message

• **message**: `string`

Message content

#### Implementation of

IMessage.message

#### Defined in

chats/Message.ts:45

___

### messageRef

• `Readonly` **messageRef**: `DatabaseReference`

The message reference in Realtime Database

#### Defined in

chats/Message.ts:41

___

### reactions

• `Optional` **reactions**: `Record`<`string`, { `emoji`: `string` ; `name`: `string`  }\>

Emoji reactions to the message
- key: The user id of the user that reacted
- value: The emoji that the user reacted with and the name of the user

**`Example`**

```ts
{
   *  "123qwerty": { emoji: "👍", name: "John Doe"},
   * }
```

#### Implementation of

IMessage.reactions

#### Defined in

chats/Message.ts:76

___

### replyTarget

• `Optional` **replyTarget**: [`ReplyRecipient`](../modules.md#replyrecipient)

In case the message is a reply to another message, this property will contain the message that is being replied to.

#### Implementation of

IMessage.replyTarget

#### Defined in

chats/Message.ts:62

___

### seenBy

• `Optional` **seenBy**: `Record`<`string`, `boolean`\>

The users that have seen the message
- key: The user id of the user that has seen the message
- value: true

**`Example`**

```ts
{
   *  "123qwerty": true,
   * }
```

**`Remarks`**

This property is only used in 1-on-1 chats

#### Implementation of

IMessage.seenBy

#### Defined in

chats/Message.ts:93

___

### sender

• **sender**: [`Sender`](../modules.md#sender)

The sender of the message

#### Implementation of

IMessage.sender

#### Defined in

chats/Message.ts:66

___

### sourceUrl

• **sourceUrl**: `string`

The source url of the attachment if it is a mediaUri

#### Implementation of

IMessage.sourceUrl

#### Defined in

chats/Message.ts:105

___

### systemType

• **systemType**: ``"start"``

The type of the system message
- start: The first message of the chat

#### Implementation of

IMessage.systemType

#### Defined in

chats/Message.ts:58

___

### type

• **type**: ``"attachment"`` \| ``"text"`` \| ``"system"`` \| ``"youtube"`` \| ``"mediaUri"``

The type of the message

#### Implementation of

IMessage.type

#### Defined in

chats/Message.ts:53

## Accessors

### createdAtDate

• `get` **createdAtDate**(): `Dayjs`

Gets the time the message was created in a dayjs instance

#### Returns

`Dayjs`

#### Defined in

chats/Message.ts:184

___

### haveUserReaction

• `get` **haveUserReaction**(): `boolean`

Check if the message has user reactions

#### Returns

`boolean`

#### Defined in

chats/Message.ts:191

___

### toReplyData

• `get` **toReplyData**(): ``null`` \| [`ReplyRecipient`](../modules.md#replyrecipient)

Extracts the data that we can use to reply to the message
- This method is used to reply to a message

#### Returns

``null`` \| [`ReplyRecipient`](../modules.md#replyrecipient)

#### Defined in

chats/Message.ts:151

## Methods

### addReaction

▸ **addReaction**(`emoji?`): `Promise`<`void`\>

Adds a reaction to the message

**`Remarks`**

To remove a reaction, pass `undefined` as the emoji parameter or don't pass any parameter

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `emoji?` | `string` | The emoji to react with (e.g. "👍") (max 1 emoji) |

#### Returns

`Promise`<`void`\>

#### Defined in

chats/Message.ts:204

___

### delete

▸ **delete**(): `Promise`<`void`\>

Deletes the message

#### Returns

`Promise`<`void`\>

#### Defined in

chats/Message.ts:250

___

### stateUpdate

▸ **stateUpdate**(`newState`): `void`

Updates the content of the message (Used when a message is edited from the database)

**`Remarks`**

This method is used internally

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `newState` | [`IMessage`](../modules.md#imessage)<`number`\> | The new state of the message |

#### Returns

`void`

#### Defined in

chats/Message.ts:260

___

### updateLastVisitedBy

▸ **updateLastVisitedBy**(): `Promise`<`void`\>

Updates the user that has seen the message

**`Remarks`**

This method is only used in 1-on-1 chats

#### Returns

`Promise`<`void`\>

#### Defined in

chats/Message.ts:234
