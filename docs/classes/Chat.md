[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / Chat

# Class: Chat

A Chat is a conversation between two users.
- A chat, (or Direct Message) is a global chat between two users independent of any location.
- To create a chat, you and the other user must be in the same organization.

## Implements

- [`IChat`](../interfaces/IChat.md)
- [`PrimaryFirestore`](../modules.md#primaryfirestore)

## Table of contents

### Constructors

- [constructor](Chat.md#constructor)

### Properties

- [createdAt](Chat.md#createdat)
- [docRef](Chat.md#docref)
- [id](Chat.md#id)
- [members](Chat.md#members)
- [membersList](Chat.md#memberslist)
- [muted](Chat.md#muted)
- [recentMessage](Chat.md#recentmessage)
- [firestoreConverter](Chat.md#firestoreconverter)

### Accessors

- [getOrderTime](Chat.md#getordertime)
- [isMuted](Chat.md#ismuted)
- [recipient](Chat.md#recipient)

### Methods

- [toggleMuteChat](Chat.md#togglemutechat)

## Constructors

### constructor

• **new Chat**(`data`, `firestoreBase`)

Creates an instance of Chat.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`IChat`](../interfaces/IChat.md) | The data of the chat. |
| `firestoreBase` | [`PrimaryFirestore`](../modules.md#primaryfirestore) | The firestore base of the chat. |

#### Defined in

chats/Chat.ts:87

## Properties

### createdAt

• `Readonly` **createdAt**: `Timestamp`

The timestamp of when the chat was created.

#### Implementation of

[IChat](../interfaces/IChat.md).[createdAt](../interfaces/IChat.md#createdat)

#### Defined in

chats/Chat.ts:50

___

### docRef

• `Readonly` **docRef**: `DocumentReference`<`DocumentData`\>

The document reference of the chat.

#### Implementation of

PrimaryFirestore.docRef

#### Defined in

chats/Chat.ts:42

___

### id

• `Readonly` **id**: `string`

The id of the chat.

#### Implementation of

PrimaryFirestore.id

#### Defined in

chats/Chat.ts:38

___

### members

• `Readonly` **members**: `Record`<`string`, `Omit`<[`Recipient`](../modules.md#recipient), ``"id"``\>\>

The members of the chat.

#### Implementation of

[IChat](../interfaces/IChat.md).[members](../interfaces/IChat.md#members)

#### Defined in

chats/Chat.ts:54

___

### membersList

• `Readonly` **membersList**: `string`[]

The membersList is an array of the ids of the members of the chat.

#### Implementation of

[IChat](../interfaces/IChat.md).[membersList](../interfaces/IChat.md#memberslist)

#### Defined in

chats/Chat.ts:62

___

### muted

• `Readonly` **muted**: `string`[] = `[]`

The muted array contains the ids of users who have muted this chat.

#### Implementation of

[IChat](../interfaces/IChat.md).[muted](../interfaces/IChat.md#muted)

#### Defined in

chats/Chat.ts:46

___

### recentMessage

• `Optional` `Readonly` **recentMessage**: `Timestamp`

The recentMessage timestamp is updated whenever a new message is added to the chat.

#### Implementation of

[IChat](../interfaces/IChat.md).[recentMessage](../interfaces/IChat.md#recentmessage)

#### Defined in

chats/Chat.ts:58

___

### firestoreConverter

▪ `Static` **firestoreConverter**: `FirestoreDataConverter`<[`Chat`](Chat.md)\>

Convert a QueryDocumentSnapshot to a Chat instance.

#### Defined in

chats/Chat.ts:67

## Accessors

### getOrderTime

• `get` **getOrderTime**(): `Date`

- If we have a recent message, we can use its timestamp to sort the chats.
- If we don't have a recent message, we can use the createdAt timestamp.

#### Returns

`Date`

#### Defined in

chats/Chat.ts:104

___

### isMuted

• `get` **isMuted**(): `boolean`

Check if the current user has muted this chat.

#### Returns

`boolean`

#### Defined in

chats/Chat.ts:111

___

### recipient

• `get` **recipient**(): [`Recipient`](../modules.md#recipient)

Get the other user in the chat.
- This is useful for displaying the other user's name and avatar in the chat list.
- This is also useful for displaying the other user's name and avatar in the chat header.

#### Returns

[`Recipient`](../modules.md#recipient)

#### Defined in

chats/Chat.ts:123

## Methods

### toggleMuteChat

▸ **toggleMuteChat**(): `Promise`<`void`\>

Change the muted status of the current user by adding or removing their id from the muted array.

#### Returns

`Promise`<`void`\>

#### Defined in

chats/Chat.ts:149
