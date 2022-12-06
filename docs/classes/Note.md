[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / Note

# Class: Note

A class that represents a note in the database.
- A note is a document that can be attached to a Notes board.

## Implements

- [`INote`](../interfaces/INote.md)
- [`PrimaryFirestore`](../modules.md#primaryfirestore)

## Table of contents

### Constructors

- [constructor](Note.md#constructor)

### Properties

- [author](Note.md#author)
- [content](Note.md#content)
- [docRef](Note.md#docref)
- [id](Note.md#id)
- [title](Note.md#title)
- [updated](Note.md#updated)
- [firestoreConverter](Note.md#firestoreconverter)

### Accessors

- [createdAt](Note.md#createdat)

### Methods

- [delete](Note.md#delete)
- [update](Note.md#update)
- [NewNote](Note.md#newnote)

## Constructors

### constructor

• **new Note**(`data`, `firestoreBase`)

Create a new Note object instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`INote`](../interfaces/INote.md) | The data to create the note with |
| `firestoreBase` | [`PrimaryFirestore`](../modules.md#primaryfirestore) | The id and docRef of the note |

#### Defined in

boards/Note.ts:156

## Properties

### author

• `Readonly` **author**: `Object`

The author of the note.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `at` | `Timestamp` | The timestamp of when the note was created. |
| `id` | `string` | The id of the author. |
| `name` | `string` | The full name of the author. |

#### Implementation of

[INote](../interfaces/INote.md).[author](../interfaces/INote.md#author)

#### Defined in

boards/Note.ts:61

___

### content

• `Readonly` **content**: `string`

The content of the note.
- This is the main body of the note.
- This is the only required field.

#### Implementation of

[INote](../interfaces/INote.md).[content](../interfaces/INote.md#content)

#### Defined in

boards/Note.ts:49

___

### docRef

• `Readonly` **docRef**: `DocumentReference`<`DocumentData`\>

The document reference of the note.

#### Implementation of

PrimaryFirestore.docRef

#### Defined in

boards/Note.ts:57

___

### id

• `Readonly` **id**: `string`

The id of the note.

#### Implementation of

PrimaryFirestore.id

#### Defined in

boards/Note.ts:53

___

### title

• `Optional` `Readonly` **title**: `string`

The title of the note.

#### Implementation of

[INote](../interfaces/INote.md).[title](../interfaces/INote.md#title)

#### Defined in

boards/Note.ts:43

___

### updated

• `Optional` `Readonly` **updated**: `Object`

The data associated with the last update to the note.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `at` | `Timestamp` | The timestamp of when the note was last updated. |
| `id` | `string` | The id of the user who last updated the note. |
| `name` | `string` | The full name of the user who last updated the note. |

#### Implementation of

[INote](../interfaces/INote.md).[updated](../interfaces/INote.md#updated)

#### Defined in

boards/Note.ts:78

___

### firestoreConverter

▪ `Static` **firestoreConverter**: `FirestoreDataConverter`<[`Note`](Note.md)\>

Convert a QueryDocumentSnapshot to a Note object instance

#### Defined in

boards/Note.ts:136

## Accessors

### createdAt

• `get` **createdAt**(): `Date`

The creation date of the note

#### Returns

`Date`

#### Defined in

boards/Note.ts:171

## Methods

### delete

▸ **delete**(): `Promise`<`void`\>

Delete the note from the database

#### Returns

`Promise`<`void`\>

#### Defined in

boards/Note.ts:198

___

### update

▸ **update**(`updates`): `Promise`<`void`\>

Update the note in the database

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `updates` | `Partial`<{ `content`: `string` ; `title`: `string`  }\> | The updates to make to the note |

#### Returns

`Promise`<`void`\>

#### Defined in

boards/Note.ts:179

___

### NewNote

▸ `Static` **NewNote**(`contentRef`, `data`): `Promise`<[`Note`](Note.md)\>

Create a new note in the database and return it as a Note object instance with the id and docRef properties

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `contentRef` | `CollectionReference`<`DocumentData`\> | The reference to the content collection |
| `data` | `Object` | The data to create the note with |
| `data.content` | `string` | - |
| `data.title?` | `string` | - |

#### Returns

`Promise`<[`Note`](Note.md)\>

The new note as a Note object instance

#### Defined in

boards/Note.ts:101
