[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / [<internal\>](../modules/internal_-8.md) / UtensilsContextProps

# Interface: UtensilsContextProps

[<internal>](../modules/internal_-8.md).UtensilsContextProps

## Table of contents

### Properties

- [addUtensilChange](internal_-8.UtensilsContextProps.md#addutensilchange)
- [createUtensil](internal_-8.UtensilsContextProps.md#createutensil)
- [deleteUtensil](internal_-8.UtensilsContextProps.md#deleteutensil)
- [error](internal_-8.UtensilsContextProps.md#error)
- [loading](internal_-8.UtensilsContextProps.md#loading)
- [searchQuery](internal_-8.UtensilsContextProps.md#searchquery)
- [setSearchQuery](internal_-8.UtensilsContextProps.md#setsearchquery)
- [sortedUtensils](internal_-8.UtensilsContextProps.md#sortedutensils)
- [updateUtensil](internal_-8.UtensilsContextProps.md#updateutensil)
- [utensils](internal_-8.UtensilsContextProps.md#utensils)

## Properties

### addUtensilChange

• **addUtensilChange**: (`utensil`: `IUtensil`, `quantity`: `number`, `reason?`: `string`) => `Promise`<`void`\>

#### Type declaration

▸ (`utensil`, `quantity`, `reason?`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `utensil` | `IUtensil` |
| `quantity` | `number` |
| `reason?` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/utensils/UtensilsProvider.tsx:34](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utensils/UtensilsProvider.tsx#L34)

___

### createUtensil

• **createUtensil**: (`utensil`: `Omit`<`IUtensil`, ``"percent"``\>) => `Promise`<`void`\>

#### Type declaration

▸ (`utensil`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `utensil` | `Omit`<`IUtensil`, ``"percent"``\> |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/utensils/UtensilsProvider.tsx:33](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utensils/UtensilsProvider.tsx#L33)

___

### deleteUtensil

• **deleteUtensil**: (`utensil`: `IUtensil`) => `Promise`<`void`\>

#### Type declaration

▸ (`utensil`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `utensil` | `IUtensil` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/utensils/UtensilsProvider.tsx:43](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utensils/UtensilsProvider.tsx#L43)

___

### error

• **error**: `undefined` \| `Error`

#### Defined in

[src/utensils/UtensilsProvider.tsx:44](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utensils/UtensilsProvider.tsx#L44)

___

### loading

• **loading**: `boolean`

#### Defined in

[src/utensils/UtensilsProvider.tsx:45](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utensils/UtensilsProvider.tsx#L45)

___

### searchQuery

• **searchQuery**: `string`

#### Defined in

[src/utensils/UtensilsProvider.tsx:31](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utensils/UtensilsProvider.tsx#L31)

___

### setSearchQuery

• **setSearchQuery**: (`query`: `string`) => `void`

#### Type declaration

▸ (`query`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |

##### Returns

`void`

#### Defined in

[src/utensils/UtensilsProvider.tsx:32](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utensils/UtensilsProvider.tsx#L32)

___

### sortedUtensils

• **sortedUtensils**: `IUtensil`[]

#### Defined in

[src/utensils/UtensilsProvider.tsx:30](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utensils/UtensilsProvider.tsx#L30)

___

### updateUtensil

• **updateUtensil**: (`utensil`: `IUtensil`, `updates`: `Partial`<`IUtensil`\>) => `Promise`<`void`\>

#### Type declaration

▸ (`utensil`, `updates`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `utensil` | `IUtensil` |
| `updates` | `Partial`<`IUtensil`\> |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/utensils/UtensilsProvider.tsx:39](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utensils/UtensilsProvider.tsx#L39)

___

### utensils

• **utensils**: `IUtensil`[]

#### Defined in

[src/utensils/UtensilsProvider.tsx:29](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/utensils/UtensilsProvider.tsx#L29)
