[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / IBoardProvider

# Interface: IBoardProvider

## Table of contents

### Properties

- [baseRef](IBoardProvider.md#baseref)
- [children](IBoardProvider.md#children)

## Properties

### baseRef

• **baseRef**: `CollectionReference`<`DocumentData`\>

The reference to the board collection

#### Defined in

boards/BoardProvider.tsx:19

___

### children

• **children**: `ReactNode` \| (`props`: { `boards?`: [`Board`](../classes/Board.md)[] ; `error?`: `Error` ; `loading`: `boolean` ; `selectedBoard?`: [`Board`](../classes/Board.md)  }) => `Element`

The Children to render.
- Can be a function.
- Can be a ReactNode.

**`Example`**

```tsx
<BoardProvider baseRef={baseRef}>
 {({loading, error, boards, selectedBoard}) => (<div>{selectedBoard.name}</div>)}
</BoardProvider>
```

#### Defined in

boards/BoardProvider.tsx:31
