[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / Conversation

# Class: Conversation

A Conversation is a conversation between two or more users.
- A conversations always takes place in a location.

## Implements

- [`IConversation`](../interfaces/IConversation.md)
- [`PrimaryFirestore`](../modules.md#primaryfirestore)
- [`FirebaseSignature`](../modules.md#firebasesignature)

## Table of contents

### Constructors

- [constructor](Conversation.md#constructor)

### Properties

- [createdAt](Conversation.md#createdat)
- [createdBy](Conversation.md#createdby)
- [description](Conversation.md#description)
- [docRef](Conversation.md#docref)
- [hosts](Conversation.md#hosts)
- [id](Conversation.md#id)
- [locationId](Conversation.md#locationid)
- [members](Conversation.md#members)
- [muted](Conversation.md#muted)
- [name](Conversation.md#name)
- [position](Conversation.md#position)
- [privacyLevel](Conversation.md#privacylevel)
- [firestoreConverter](Conversation.md#firestoreconverter)

### Accessors

- [getOrderTime](Conversation.md#getordertime)
- [iAmHost](Conversation.md#iamhost)
- [iAmMember](Conversation.md#iammember)
- [isMuted](Conversation.md#ismuted)

### Methods

- [addHost](Conversation.md#addhost)
- [addMembers](Conversation.md#addmembers)
- [delete](Conversation.md#delete)
- [removeHost](Conversation.md#removehost)
- [removeMember](Conversation.md#removemember)
- [toggleMuteChat](Conversation.md#togglemutechat)
- [update](Conversation.md#update)

## Constructors

### constructor

• **new Conversation**(`data`, `firestoreBase`)

Create a new instance of a Conversation class.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`IConversation`](../interfaces/IConversation.md) & [`FirebaseSignature`](../modules.md#firebasesignature)<`Timestamp`\> | The base data from which to create the conversation. |
| `firestoreBase` | [`PrimaryFirestore`](../modules.md#primaryfirestore) | The id and docRef of the document. |

#### Defined in

chats/Conversation.ts:113

## Properties

### createdAt

• `Readonly` **createdAt**: `Timestamp`

The timestamp of when the chat was created.

#### Implementation of

FirebaseSignature.createdAt

#### Defined in

chats/Conversation.ts:84

___

### createdBy

• `Readonly` **createdBy**: `string`

The id of the creator of the chat.

#### Implementation of

FirebaseSignature.createdBy

#### Defined in

chats/Conversation.ts:88

___

### description

• `Optional` `Readonly` **description**: `string`

The description of the chat.

#### Implementation of

[IConversation](../interfaces/IConversation.md).[description](../interfaces/IConversation.md#description)

#### Defined in

chats/Conversation.ts:64

___

### docRef

• `Readonly` **docRef**: `DocumentReference`<`DocumentData`\>

The document reference of the chat.

#### Implementation of

PrimaryFirestore.docRef

#### Defined in

chats/Conversation.ts:48

___

### hosts

• `Optional` `Readonly` **hosts**: `string`[]

The hosts is an array of the ids of the hosts of the chat.

#### Implementation of

[IConversation](../interfaces/IConversation.md).[hosts](../interfaces/IConversation.md#hosts)

#### Defined in

chats/Conversation.ts:68

___

### id

• `Readonly` **id**: `string`

The id of the chat.

#### Implementation of

PrimaryFirestore.id

#### Defined in

chats/Conversation.ts:44

___

### locationId

• `Readonly` **locationId**: `string`

The id of the location where the chat takes place.

#### Implementation of

[IConversation](../interfaces/IConversation.md).[locationId](../interfaces/IConversation.md#locationid)

#### Defined in

chats/Conversation.ts:72

___

### members

• `Optional` `Readonly` **members**: `string`[]

The members is an array of the ids of the users in the chat.

#### Implementation of

[IConversation](../interfaces/IConversation.md).[members](../interfaces/IConversation.md#members)

#### Defined in

chats/Conversation.ts:56

___

### muted

• `Optional` `Readonly` **muted**: `string`[]

The muted array contains the ids of users who have muted this chat.

#### Implementation of

[IConversation](../interfaces/IConversation.md).[muted](../interfaces/IConversation.md#muted)

#### Defined in

chats/Conversation.ts:52

___

### name

• `Readonly` **name**: `string`

The name of the chat.

#### Implementation of

[IConversation](../interfaces/IConversation.md).[name](../interfaces/IConversation.md#name)

#### Defined in

chats/Conversation.ts:60

___

### position

• `Optional` `Readonly` **position**: `string`

The position linked to the chat.

#### Implementation of

[IConversation](../interfaces/IConversation.md).[position](../interfaces/IConversation.md#position)

#### Defined in

chats/Conversation.ts:80

___

### privacyLevel

• `Readonly` **privacyLevel**: [`PrivacyLevel`](../enums/PrivacyLevel.md)

The privacy level of the chat.

#### Implementation of

[IConversation](../interfaces/IConversation.md).[privacyLevel](../interfaces/IConversation.md#privacylevel)

#### Defined in

chats/Conversation.ts:76

___

### firestoreConverter

▪ `Static` **firestoreConverter**: `FirestoreDataConverter`<[`Conversation`](Conversation.md)\>

Convert a queryDocumentSnapshot to a Conversation class.

#### Defined in

chats/Conversation.ts:93

## Accessors

### getOrderTime

• `get` **getOrderTime**(): `Date`

- If we have a recent message, we can use its timestamp to sort the chats.
- If we don't have a recent message, we can use the createdAt timestamp.

#### Returns

`Date`

#### Defined in

chats/Conversation.ts:148

___

### iAmHost

• `get` **iAmHost**(): `boolean`

Check if the current user is a host of this conversation.

#### Returns

`boolean`

#### Defined in

chats/Conversation.ts:155

___

### iAmMember

• `get` **iAmMember**(): `boolean`

Check if the current user is a direct member of this conversation.

#### Returns

`boolean`

#### Defined in

chats/Conversation.ts:175

___

### isMuted

• `get` **isMuted**(): `boolean`

Check if the current user has muted this chat.

#### Returns

`boolean`

#### Defined in

chats/Conversation.ts:165

## Methods

### addHost

▸ **addHost**(`newHost`): `Promise`<`void`\>

Adds a host to the conversation.
- The host is also added to the members array.

#### Parameters

| Name | Type |
| :------ | :------ |
| `newHost` | [`Employee`](Employee.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

chats/Conversation.ts:204

___

### addMembers

▸ **addMembers**(`addedEmployees`): `Promise`<`void`\>

Adds a member to the conversation.
- We can only add members if the conversation is private.

#### Parameters

| Name | Type |
| :------ | :------ |
| `addedEmployees` | [`Employee`](Employee.md)[] |

#### Returns

`Promise`<`void`\>

#### Defined in

chats/Conversation.ts:237

___

### delete

▸ **delete**(): `Promise`<`void`\>

Delete the conversation.

#### Returns

`Promise`<`void`\>

#### Defined in

chats/Conversation.ts:281

___

### removeHost

▸ **removeHost**(`host`): `Promise`<`void`\>

Removes a host from the conversation.
- If the host meets the membership requirements, they will remain a member.

#### Parameters

| Name | Type |
| :------ | :------ |
| `host` | [`Employee`](Employee.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

chats/Conversation.ts:214

___

### removeMember

▸ **removeMember**(`memberId`): `Promise`<`void`\>

Removes a member from the conversation.
- We can only remove members if the conversation is private.

#### Parameters

| Name | Type |
| :------ | :------ |
| `memberId` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

chats/Conversation.ts:252

___

### toggleMuteChat

▸ **toggleMuteChat**(): `Promise`<`void`\>

Change the muted status of the current user by adding or removing their id from the muted array.

#### Returns

`Promise`<`void`\>

#### Defined in

chats/Conversation.ts:185

___

### update

▸ **update**(`updates`): `Promise`<`void`\>

Update the public and writable fields of the conversation.

**`Description`**

**The fields that can be updated are:**
- name
- description
- position

#### Parameters

| Name | Type |
| :------ | :------ |
| `updates` | `PartialWithFieldValue`<`Pick`<[`IConversation`](../interfaces/IConversation.md), ``"name"`` \| ``"position"`` \| ``"description"``\>\> |

#### Returns

`Promise`<`void`\>

#### Defined in

chats/Conversation.ts:270
