[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / Board

# Class: Board

A class that represents a board in the database.

## Implements

- [`IBoard`](../interfaces/IBoard.md)
- [`PrimaryFirestore`](../modules.md#primaryfirestore)
- [`FirebaseSignature`](../modules.md#firebasesignature)

## Table of contents

### Constructors

- [constructor](Board.md#constructor)

### Properties

- [accessTags](Board.md#accesstags)
- [createdAt](Board.md#createdat)
- [createdBy](Board.md#createdby)
- [description](Board.md#description)
- [docRef](Board.md#docref)
- [hosts](Board.md#hosts)
- [id](Board.md#id)
- [locationId](Board.md#locationid)
- [name](Board.md#name)
- [privacyLevel](Board.md#privacylevel)
- [firestoreConverter](Board.md#firestoreconverter)

### Accessors

- [amIhost](Board.md#amihost)
- [contentRef](Board.md#contentref)
- [getMembers](Board.md#getmembers)
- [position](Board.md#position)

### Methods

- [addHost](Board.md#addhost)
- [addMembers](Board.md#addmembers)
- [delete](Board.md#delete)
- [removeHost](Board.md#removehost)
- [removeMember](Board.md#removemember)
- [update](Board.md#update)

## Constructors

### constructor

• **new Board**(`boardData`, `firestoreBase`)

Creates a new Board instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `boardData` | [`IBoard`](../interfaces/IBoard.md) & [`FirebaseSignature`](../modules.md#firebasesignature)<`Timestamp`\> | The data to create the board with. |
| `firestoreBase` | [`PrimaryFirestore`](../modules.md#primaryfirestore) | The id and docRef of the board. |

#### Defined in

boards/Board.ts:101

## Properties

### accessTags

• `Optional` `Readonly` **accessTags**: `string`[]

The access tags used to determine who can access this board.
[Access Tags](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/c4a61dda39bafb9c93841e88e18a6c170f3a51dd/src/models/boards/Board.MD)

#### Implementation of

[IBoard](../interfaces/IBoard.md).[accessTags](../interfaces/IBoard.md#accesstags)

#### Defined in

boards/Board.ts:63

___

### createdAt

• `Readonly` **createdAt**: `Timestamp`

The timestamp of when this board was created.

#### Implementation of

FirebaseSignature.createdAt

#### Defined in

boards/Board.ts:75

___

### createdBy

• `Readonly` **createdBy**: `string`

The id of the user who created this board.

#### Implementation of

FirebaseSignature.createdBy

#### Defined in

boards/Board.ts:79

___

### description

• `Optional` `Readonly` **description**: `string`

The description of the board.

#### Implementation of

[IBoard](../interfaces/IBoard.md).[description](../interfaces/IBoard.md#description)

#### Defined in

boards/Board.ts:45

___

### docRef

• `Readonly` **docRef**: `DocumentReference`<`DocumentData`\>

The Firestore document reference of this board.

#### Implementation of

PrimaryFirestore.docRef

#### Defined in

boards/Board.ts:71

___

### hosts

• `Optional` `Readonly` **hosts**: `string`[]

An array of the ids of the hosts of this board.

#### Implementation of

[IBoard](../interfaces/IBoard.md).[hosts](../interfaces/IBoard.md#hosts)

#### Defined in

boards/Board.ts:49

___

### id

• `Readonly` **id**: `string`

The Id of the board

#### Implementation of

PrimaryFirestore.id

#### Defined in

boards/Board.ts:67

___

### locationId

• `Readonly` **locationId**: `string`

The id of the location this board is in.

#### Implementation of

[IBoard](../interfaces/IBoard.md).[locationId](../interfaces/IBoard.md#locationid)

#### Defined in

boards/Board.ts:53

___

### name

• `Readonly` **name**: `string`

The title given to the board.

#### Implementation of

[IBoard](../interfaces/IBoard.md).[name](../interfaces/IBoard.md#name)

#### Defined in

boards/Board.ts:41

___

### privacyLevel

• `Readonly` **privacyLevel**: [`PrivacyLevel`](../enums/PrivacyLevel.md)

The privacy level of the board.

**`See`**

PrivacyLevel

#### Implementation of

[IBoard](../interfaces/IBoard.md).[privacyLevel](../interfaces/IBoard.md#privacylevel)

#### Defined in

boards/Board.ts:58

___

### firestoreConverter

▪ `Static` **firestoreConverter**: `FirestoreDataConverter`<[`Board`](Board.md)\>

#### Defined in

boards/Board.ts:81

## Accessors

### amIhost

• `get` **amIhost**(): `boolean`

Returns true if the current user is a host of this board.

#### Returns

`boolean`

#### Defined in

boards/Board.ts:136

___

### contentRef

• `get` **contentRef**(): `CollectionReference`<`DocumentData`\>

Reference of the content collection of this board.

#### Returns

`CollectionReference`<`DocumentData`\>

#### Defined in

boards/Board.ts:129

___

### getMembers

• `get` **getMembers**(): ``null`` \| `string`[]

Get the members of this board.

**`Remarks`**

This method will return null if the privacy level is not set to private.

#### Returns

``null`` \| `string`[]

#### Defined in

boards/Board.ts:162

___

### position

• `get` **position**(): `undefined` \| ``null`` \| `string`

Returns the position linked to this board.

**`Remarks`**

This method will return null if the privacy level is not set to positions.

#### Returns

`undefined` \| ``null`` \| `string`

#### Defined in

boards/Board.ts:148

## Methods

### addHost

▸ **addHost**(`newHost`): `Promise`<`void`\>

Add a host to the board.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `newHost` | [`Employee`](Employee.md) | The new host to add. |

#### Returns

`Promise`<`void`\>

#### Defined in

boards/Board.ts:194

___

### addMembers

▸ **addMembers**(`addedEmployees`): `Promise`<`void`\>

Add new members to the board.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `addedEmployees` | [`Employee`](Employee.md)[] | The employees to add. |

#### Returns

`Promise`<`void`\>

#### Defined in

boards/Board.ts:232

___

### delete

▸ **delete**(): `Promise`<`void`\>

Deletes the board.

#### Returns

`Promise`<`void`\>

#### Defined in

boards/Board.ts:186

___

### removeHost

▸ **removeHost**(`hostId`): `Promise`<`void`\>

Remove a host from the board.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hostId` | `string` | The host to remove. |

#### Returns

`Promise`<`void`\>

#### Defined in

boards/Board.ts:213

___

### removeMember

▸ **removeMember**(`memberId`): `Promise`<`void`\>

Remove a member from the board.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `memberId` | `string` | The member to remove. |

#### Returns

`Promise`<`void`\>

#### Defined in

boards/Board.ts:248

___

### update

▸ **update**(`updates`): `Promise`<`void`\>

Updates the board with the given data.

**`Remarks`**

This method will only update the name, description, and access tags.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `updates` | `PartialWithFieldValue`<`Pick`<[`IBoard`](../interfaces/IBoard.md), ``"name"`` \| ``"description"`` \| ``"accessTags"``\>\> | The data to update. |

#### Returns

`Promise`<`void`\>

#### Defined in

boards/Board.ts:175
