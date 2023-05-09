[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / FilesContextProps

# Interface: FilesContextProps

## Table of contents

### Properties

- [addFile](FilesContextProps.md#addfile)
- [deleteFile](FilesContextProps.md#deletefile)
- [error](FilesContextProps.md#error)
- [files](FilesContextProps.md#files)
- [loading](FilesContextProps.md#loading)
- [renameFile](FilesContextProps.md#renamefile)
- [sortedFiles](FilesContextProps.md#sortedfiles)

## Properties

### addFile

• **addFile**: (`file`: `ICuttinboard_File`) => `Promise`<`void`\>

#### Type declaration

▸ (`file`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `file` | `ICuttinboard_File` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/files/FilesProvider.tsx:17](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/files/FilesProvider.tsx#L17)

___

### deleteFile

• **deleteFile**: (`file`: `ICuttinboard_File`) => `Promise`<`void`\>

#### Type declaration

▸ (`file`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `file` | `ICuttinboard_File` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/files/FilesProvider.tsx:18](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/files/FilesProvider.tsx#L18)

___

### error

• `Optional` **error**: `Error`

#### Defined in

[src/files/FilesProvider.tsx:16](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/files/FilesProvider.tsx#L16)

___

### files

• **files**: `ICuttinboard_File`[]

#### Defined in

[src/files/FilesProvider.tsx:13](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/files/FilesProvider.tsx#L13)

___

### loading

• **loading**: `boolean`

#### Defined in

[src/files/FilesProvider.tsx:15](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/files/FilesProvider.tsx#L15)

___

### renameFile

• **renameFile**: (`file`: `ICuttinboard_File`, `newName`: `string`) => `Promise`<`void`\>

#### Type declaration

▸ (`file`, `newName`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `file` | `ICuttinboard_File` |
| `newName` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/files/FilesProvider.tsx:19](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/files/FilesProvider.tsx#L19)

___

### sortedFiles

• **sortedFiles**: `ICuttinboard_File`[]

#### Defined in

[src/files/FilesProvider.tsx:14](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/files/FilesProvider.tsx#L14)
