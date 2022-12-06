[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / IChat

# Interface: IChat

Chat interface implemented by the Chat class.

## Implemented by

- [`Chat`](../classes/Chat.md)

## Table of contents

### Properties

- [createdAt](IChat.md#createdat)
- [members](IChat.md#members)
- [membersList](IChat.md#memberslist)
- [muted](IChat.md#muted)
- [recentMessage](IChat.md#recentmessage)

## Properties

### createdAt

• **createdAt**: `Timestamp`

#### Defined in

chats/Chat.ts:21

___

### members

• **members**: `Object`

#### Index signature

▪ [memberId: `string`]: { `avatar?`: `string` ; `fullName`: `string`  }

#### Defined in

chats/Chat.ts:22

___

### membersList

• **membersList**: `string`[]

#### Defined in

chats/Chat.ts:25

___

### muted

• `Optional` **muted**: `string`[]

#### Defined in

chats/Chat.ts:20

___

### recentMessage

• `Optional` **recentMessage**: `Timestamp`

#### Defined in

chats/Chat.ts:26
