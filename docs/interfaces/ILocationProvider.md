[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / ILocationProvider

# Interface: ILocationProvider

Props del Provider principal de la App

## Table of contents

### Properties

- [ErrorComponent](ILocationProvider.md#errorcomponent)
- [LoadingComponent](ILocationProvider.md#loadingcomponent)
- [children](ILocationProvider.md#children)
- [locationId](ILocationProvider.md#locationid)
- [organizationKey](ILocationProvider.md#organizationkey)

## Properties

### ErrorComponent

• **ErrorComponent**: (`error`: `Error`) => `Element`

#### Type declaration

▸ (`error`): `Element`

##### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `Error` |

##### Returns

`Element`

#### Defined in

services/LocationProvider.tsx:33

___

### LoadingComponent

• **LoadingComponent**: (`loading`: `boolean`) => `Element`

#### Type declaration

▸ (`loading`): `Element`

##### Parameters

| Name | Type |
| :------ | :------ |
| `loading` | `boolean` |

##### Returns

`Element`

#### Defined in

services/LocationProvider.tsx:34

___

### children

• **children**: `ReactNode` \| (`location`: [`Location`](../classes/Location.md)) => `Element`

#### Defined in

services/LocationProvider.tsx:30

___

### locationId

• **locationId**: `string`

#### Defined in

services/LocationProvider.tsx:32

___

### organizationKey

• **organizationKey**: [`OrganizationKey`](../classes/OrganizationKey.md)

#### Defined in

services/LocationProvider.tsx:31
