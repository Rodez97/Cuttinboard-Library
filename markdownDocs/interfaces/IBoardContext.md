[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / IBoardContext

# Interface: IBoardContext

The Board Provider Context

## Table of contents

### Properties

- [addHost](IBoardContext.md#addhost)
- [addMembers](IBoardContext.md#addmembers)
- [addNewBoard](IBoardContext.md#addnewboard)
- [boards](IBoardContext.md#boards)
- [canManageBoard](IBoardContext.md#canmanageboard)
- [deleteBoard](IBoardContext.md#deleteboard)
- [error](IBoardContext.md#error)
- [loading](IBoardContext.md#loading)
- [removeHost](IBoardContext.md#removehost)
- [removeMember](IBoardContext.md#removemember)
- [selectBoardId](IBoardContext.md#selectboardid)
- [selectedBoard](IBoardContext.md#selectedboard)
- [updateBoard](IBoardContext.md#updateboard)

## Properties

### addHost

• **addHost**: (`board`: `IBoard`, `newHost`: `IEmployee`) => `Promise`<`void`\>

#### Type declaration

▸ (`board`, `newHost`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `board` | `IBoard` |
| `newHost` | `IEmployee` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/boards/BoardProvider.tsx:48](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/BoardProvider.tsx#L48)

___

### addMembers

• **addMembers**: (`board`: `IBoard`, `newMembers`: `IEmployee`[]) => `Promise`<`void`\>

#### Type declaration

▸ (`board`, `newMembers`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `board` | `IBoard` |
| `newMembers` | `IEmployee`[] |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/boards/BoardProvider.tsx:50](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/BoardProvider.tsx#L50)

___

### addNewBoard

• **addNewBoard**: (`props`: { `description?`: `string` ; `name`: `string` ; `position?`: `string` ; `privacyLevel`: `PrivacyLevel`  }) => `Promise`<`string`\>

#### Type declaration

▸ (`props`): `Promise`<`string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `props.description?` | `string` |
| `props.name` | `string` |
| `props.position?` | `string` |
| `props.privacyLevel` | `PrivacyLevel` |

##### Returns

`Promise`<`string`\>

#### Defined in

[src/boards/BoardProvider.tsx:40](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/BoardProvider.tsx#L40)

___

### boards

• **boards**: `IBoard`[]

#### Defined in

[src/boards/BoardProvider.tsx:34](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/BoardProvider.tsx#L34)

___

### canManageBoard

• **canManageBoard**: `boolean`

#### Defined in

[src/boards/BoardProvider.tsx:39](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/BoardProvider.tsx#L39)

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

[src/boards/BoardProvider.tsx:46](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/BoardProvider.tsx#L46)

___

### error

• `Optional` **error**: `Error`

#### Defined in

[src/boards/BoardProvider.tsx:38](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/BoardProvider.tsx#L38)

___

### loading

• **loading**: `boolean`

#### Defined in

[src/boards/BoardProvider.tsx:37](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/BoardProvider.tsx#L37)

___

### removeHost

• **removeHost**: (`board`: `IBoard`, `hostId`: `string`) => `Promise`<`void`\>

#### Type declaration

▸ (`board`, `hostId`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `board` | `IBoard` |
| `hostId` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/boards/BoardProvider.tsx:49](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/BoardProvider.tsx#L49)

___

### removeMember

• **removeMember**: (`board`: `IBoard`, `memberId`: `string`) => `Promise`<`void`\>

#### Type declaration

▸ (`board`, `memberId`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `board` | `IBoard` |
| `memberId` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/boards/BoardProvider.tsx:51](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/BoardProvider.tsx#L51)

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

[src/boards/BoardProvider.tsx:36](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/BoardProvider.tsx#L36)

___

### selectedBoard

• `Optional` **selectedBoard**: `IBoard`

#### Defined in

[src/boards/BoardProvider.tsx:35](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/BoardProvider.tsx#L35)

___

### updateBoard

• **updateBoard**: (`board`: `IBoard`, `updates`: `BoardUpdate`) => `Promise`<`void`\>

#### Type declaration

▸ (`board`, `updates`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `board` | `IBoard` |
| `updates` | `BoardUpdate` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/boards/BoardProvider.tsx:47](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/boards/BoardProvider.tsx#L47)
