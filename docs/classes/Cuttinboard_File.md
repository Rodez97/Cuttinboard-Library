[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / Cuttinboard\_File

# Class: Cuttinboard\_File

A class that represents a file uploaded to cloud storage from a Files Drawer.

## Implements

- [`ICuttinboard_File`](../interfaces/ICuttinboard_File.md)
- [`PrimaryFirestore`](../modules.md#primaryfirestore)
- [`FirebaseSignature`](../modules.md#firebasesignature)

## Table of contents

### Constructors

- [constructor](Cuttinboard_File.md#constructor)

### Properties

- [createdAt](Cuttinboard_File.md#createdat)
- [createdBy](Cuttinboard_File.md#createdby)
- [docRef](Cuttinboard_File.md#docref)
- [downloadUrl](Cuttinboard_File.md#downloadurl)
- [fileType](Cuttinboard_File.md#filetype)
- [id](Cuttinboard_File.md#id)
- [name](Cuttinboard_File.md#name)
- [size](Cuttinboard_File.md#size)
- [storagePath](Cuttinboard_File.md#storagepath)
- [firestoreConverter](Cuttinboard_File.md#firestoreconverter)

### Accessors

- [fileRef](Cuttinboard_File.md#fileref)

### Methods

- [delete](Cuttinboard_File.md#delete)
- [getUrl](Cuttinboard_File.md#geturl)
- [rename](Cuttinboard_File.md#rename)

## Constructors

### constructor

• **new Cuttinboard_File**(`data`, `firestoreBase`)

Creates a new [Cuttinboard_File] instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`ICuttinboard_File`](../interfaces/ICuttinboard_File.md) & [`FirebaseSignature`](../modules.md#firebasesignature)<`Timestamp`\> | The data to create this file with |
| `firestoreBase` | [`PrimaryFirestore`](../modules.md#primaryfirestore) | The id and document reference for this file in firestore |

#### Defined in

boards/Cuttinboard_File.ts:99

## Properties

### createdAt

• `Readonly` **createdAt**: `Timestamp`

The timestamp of when this file was created

#### Implementation of

FirebaseSignature.createdAt

#### Defined in

boards/Cuttinboard_File.ts:64

___

### createdBy

• `Readonly` **createdBy**: `string`

The id of the user who uploaded this file

#### Implementation of

FirebaseSignature.createdBy

#### Defined in

boards/Cuttinboard_File.ts:68

___

### docRef

• `Readonly` **docRef**: `DocumentReference`<`DocumentData`\>

The document reference for this file in firestore.

#### Implementation of

PrimaryFirestore.docRef

#### Defined in

boards/Cuttinboard_File.ts:60

___

### downloadUrl

• `Private` `Optional` **downloadUrl**: `string`

The download URL for this file

**`Remarks`**

This is obtained from storage and is cached here.

#### Defined in

boards/Cuttinboard_File.ts:74

___

### fileType

• `Readonly` **fileType**: `string`

The mime type of the file.

**`See`**

https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types

#### Implementation of

[ICuttinboard_File](../interfaces/ICuttinboard_File.md).[fileType](../interfaces/ICuttinboard_File.md#filetype)

#### Defined in

boards/Cuttinboard_File.ts:45

___

### id

• `Readonly` **id**: `string`

The id of the document in firestore.

#### Implementation of

PrimaryFirestore.id

#### Defined in

boards/Cuttinboard_File.ts:56

___

### name

• `Readonly` **name**: `string`

The mutable name of the file.

#### Implementation of

[ICuttinboard_File](../interfaces/ICuttinboard_File.md).[name](../interfaces/ICuttinboard_File.md#name)

#### Defined in

boards/Cuttinboard_File.ts:36

___

### size

• `Readonly` **size**: `number`

The size of the file in bytes.

**`See`**

https://developer.mozilla.org/en-US/docs/Web/API/File/size

**`Remarks`**

This is a read-only property.

#### Implementation of

[ICuttinboard_File](../interfaces/ICuttinboard_File.md).[size](../interfaces/ICuttinboard_File.md#size)

#### Defined in

boards/Cuttinboard_File.ts:52

___

### storagePath

• `Readonly` **storagePath**: `string`

The path to the file in cloud storage.

#### Implementation of

[ICuttinboard_File](../interfaces/ICuttinboard_File.md).[storagePath](../interfaces/ICuttinboard_File.md#storagepath)

#### Defined in

boards/Cuttinboard_File.ts:40

___

### firestoreConverter

▪ `Static` **firestoreConverter**: `FirestoreDataConverter`<[`Cuttinboard_File`](Cuttinboard_File.md)\>

Converts a firestore document snapshot to a [Cuttinboard_File] instance

#### Defined in

boards/Cuttinboard_File.ts:79

## Accessors

### fileRef

• `get` **fileRef**(): `StorageReference`

Returns the storage reference for this file

#### Returns

`StorageReference`

#### Defined in

boards/Cuttinboard_File.ts:123

## Methods

### delete

▸ **delete**(): `Promise`<`void`\>

Deletes this file from storage and firestore

#### Returns

`Promise`<`void`\>

#### Defined in

boards/Cuttinboard_File.ts:146

___

### getUrl

▸ **getUrl**(): `Promise`<`string`\>

Returns the download URL for this file

**`Remarks`**

This is cached in the [downloadUrl] property.

#### Returns

`Promise`<`string`\>

#### Defined in

boards/Cuttinboard_File.ts:132

___

### rename

▸ **rename**(`newName`): `Promise`<`void`\>

Updates the name of this file

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `newName` | `string` | The new name for this file |

#### Returns

`Promise`<`void`\>

#### Defined in

boards/Cuttinboard_File.ts:157
