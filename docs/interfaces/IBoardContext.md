[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / IBoardContext

# Interface: IBoardContext

The Board Provider Context

## Table of contents

### Properties

- [addNewBoard](IBoardContext.md#addnewboard)
- [boards](IBoardContext.md#boards)
- [canManageBoard](IBoardContext.md#canmanageboard)
- [error](IBoardContext.md#error)
- [loading](IBoardContext.md#loading)
- [selectBoard](IBoardContext.md#selectboard)
- [selectedBoard](IBoardContext.md#selectedboard)

## Properties

### addNewBoard

• **addNewBoard**: (`newBoardData`: `Omit`<[`IBoard`](IBoard.md), ``"locationId"``\>) => `Promise`<`string`\>

#### Type declaration

▸ (`newBoardData`): `Promise`<`string`\>

The addNewBoard function is used to add a new board to a database, and return its ID.

**`Remarks`**

If the privacyLevel of the new board is set to PUBLIC, the function also adds the "pl_public" access tag to the elementToAdd object.

**`Example`**

```tsx
const newBoardId = await addNewBoard({
 name: "New Board",
 privacyLevel: PrivacyLevel.PRIVATE,
});
```

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `newBoardData` | `Omit`<[`IBoard`](IBoard.md), ``"locationId"``\> | The data for the new board. |

##### Returns

`Promise`<`string`\>

The ID of the newly added board.

#### Defined in

boards/BoardProvider.tsx:80

___

### boards

• `Optional` **boards**: [`Board`](../classes/Board.md)[]

The list of boards

#### Defined in

boards/BoardProvider.tsx:84

___

### canManageBoard

• **canManageBoard**: `boolean`

Whether the current user has the ability to manage the selected board.

#### Defined in

boards/BoardProvider.tsx:88

___

### error

• `Optional` **error**: `Error`

The error if there is one

#### Defined in

boards/BoardProvider.tsx:96

___

### loading

• **loading**: `boolean`

Whether the data is loading

#### Defined in

boards/BoardProvider.tsx:92

___

### selectBoard

• **selectBoard**: (`id`: `string`) => `void`

#### Type declaration

▸ (`id`): `void`

Selects a board by its ID

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | The ID of the board to select |

##### Returns

`void`

#### Defined in

boards/BoardProvider.tsx:65

___

### selectedBoard

• `Optional` **selectedBoard**: [`Board`](../classes/Board.md)

The selected board, or undefined if not found.

#### Defined in

boards/BoardProvider.tsx:60
