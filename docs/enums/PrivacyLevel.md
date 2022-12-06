[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / PrivacyLevel

# Enumeration: PrivacyLevel

Privacy level of board.
- Controls the visibility of the board by the employees.

## Table of contents

### Enumeration Members

- [POSITIONS](PrivacyLevel.md#positions)
- [PRIVATE](PrivacyLevel.md#private)
- [PUBLIC](PrivacyLevel.md#public)

## Enumeration Members

### POSITIONS

• **POSITIONS** = ``1``

The board is visible to employees that have the positions specified in the board.

**`Example`**

```ts
// Only employees with the position "Server" can see the board.
const board = new Board({
  privacyLevel: PrivacyLevel.POSITIONS,
  position: "Server"
});
```

#### Defined in

[utils/PrivacyLevel.ts:30](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/utils/PrivacyLevel.ts#L30)

___

### PRIVATE

• **PRIVATE** = ``0``

The board is visible to the employees that are assigned to the board.

**`Example`**

```ts
// Only employees assigned to the board can see it.
const board = new Board({
  privacyLevel: PrivacyLevel.PRIVATE
});
```

#### Defined in

[utils/PrivacyLevel.ts:42](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/utils/PrivacyLevel.ts#L42)

___

### PUBLIC

• **PUBLIC** = ``2``

The board is visible to all employees.

**`Example`**

```ts
// All employees can see the board.
const board = new Board({
  privacyLevel: PrivacyLevel.PUBLIC
});
```

#### Defined in

[utils/PrivacyLevel.ts:17](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/utils/PrivacyLevel.ts#L17)
