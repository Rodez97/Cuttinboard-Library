[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / NotesContextProps

# Interface: NotesContextProps

## Table of contents

### Properties

- [addNote](NotesContextProps.md#addnote)
- [deleteNote](NotesContextProps.md#deletenote)
- [error](NotesContextProps.md#error)
- [loading](NotesContextProps.md#loading)
- [notes](NotesContextProps.md#notes)
- [sortedNotes](NotesContextProps.md#sortednotes)
- [updateNote](NotesContextProps.md#updatenote)

## Properties

### addNote

• **addNote**: (`note`: `INote`) => `Promise`<`void`\>

#### Type declaration

▸ (`note`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `note` | `INote` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/notes/NotesProvider.tsx:14](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/notes/NotesProvider.tsx#L14)

___

### deleteNote

• **deleteNote**: (`note`: `INote`) => `Promise`<`void`\>

#### Type declaration

▸ (`note`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `note` | `INote` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/notes/NotesProvider.tsx:15](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/notes/NotesProvider.tsx#L15)

___

### error

• `Optional` **error**: `Error`

#### Defined in

[src/notes/NotesProvider.tsx:13](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/notes/NotesProvider.tsx#L13)

___

### loading

• **loading**: `boolean`

#### Defined in

[src/notes/NotesProvider.tsx:12](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/notes/NotesProvider.tsx#L12)

___

### notes

• **notes**: `INote`[]

#### Defined in

[src/notes/NotesProvider.tsx:10](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/notes/NotesProvider.tsx#L10)

___

### sortedNotes

• **sortedNotes**: `INote`[]

#### Defined in

[src/notes/NotesProvider.tsx:11](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/notes/NotesProvider.tsx#L11)

___

### updateNote

• **updateNote**: (`note`: `INote`, `updates`: `Partial`<`INote`\>) => `Promise`<`void`\>

#### Type declaration

▸ (`note`, `updates`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `note` | `INote` |
| `updates` | `Partial`<`INote`\> |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/notes/NotesProvider.tsx:16](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/notes/NotesProvider.tsx#L16)
