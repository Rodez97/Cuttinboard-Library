[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / IGBoardContext

# Interface: IGBoardContext

The Board Provider Context

## Table of contents

### Properties

- [addNewBoard](IGBoardContext.md#addnewboard)
- [boards](IGBoardContext.md#boards)
- [deleteBoard](IGBoardContext.md#deleteboard)
- [error](IGBoardContext.md#error)
- [loading](IGBoardContext.md#loading)
- [selectBoardId](IGBoardContext.md#selectboardid)
- [selectedBoard](IGBoardContext.md#selectedboard)
- [updateBoard](IGBoardContext.md#updateboard)

## Properties

### addNewBoard

• **addNewBoard**: (`newBoardData`: { `description?`: `string` ; `name`: `string`  }) => `Promise`<`string`\>

#### Type declaration

▸ (`newBoardData`): `Promise`<`string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `newBoardData` | `Object` |
| `newBoardData.description?` | `string` |
| `newBoardData.name` | `string` |

##### Returns

`Promise`<`string`\>

#### Defined in

[src/globalBoards/GBoardProvider.tsx:29](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/globalBoards/GBoardProvider.tsx#L29)

___

### boards

• **boards**: `IBoard`[]

#### Defined in

[src/globalBoards/GBoardProvider.tsx:24](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/globalBoards/GBoardProvider.tsx#L24)

___

### deleteBoard

• **deleteBoard**: (`board`: `IBoard`) => `Promise`<`void`\>

#### Type declaration

▸ (`board`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `board` | `IBoard` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/globalBoards/GBoardProvider.tsx:40](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/globalBoards/GBoardProvider.tsx#L40)

___

### error

• `Optional` **error**: `Error`

#### Defined in

[src/globalBoards/GBoardProvider.tsx:27](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/globalBoards/GBoardProvider.tsx#L27)

___

### loading

• **loading**: `boolean`

#### Defined in

[src/globalBoards/GBoardProvider.tsx:26](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/globalBoards/GBoardProvider.tsx#L26)

___

### selectBoardId

• **selectBoardId**: (`boardId?`: `string`) => `void`

#### Type declaration

▸ (`boardId?`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `boardId?` | `string` |

##### Returns

`void`

#### Defined in

[src/globalBoards/GBoardProvider.tsx:28](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/globalBoards/GBoardProvider.tsx#L28)

___

### selectedBoard

• `Optional` **selectedBoard**: `IBoard`

#### Defined in

[src/globalBoards/GBoardProvider.tsx:25](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/globalBoards/GBoardProvider.tsx#L25)

___

### updateBoard

• **updateBoard**: (`board`: `IBoard`, `updates`: { `description?`: `string` ; `name?`: `string`  }) => `Promise`<`void`\>

#### Type declaration

▸ (`board`, `updates`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `board` | `IBoard` |
| `updates` | `Object` |
| `updates.description?` | `string` |
| `updates.name?` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/globalBoards/GBoardProvider.tsx:33](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/globalBoards/GBoardProvider.tsx#L33)
