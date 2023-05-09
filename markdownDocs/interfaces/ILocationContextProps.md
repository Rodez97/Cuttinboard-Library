[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / ILocationContextProps

# Interface: ILocationContextProps

## Table of contents

### Properties

- [addPosition](ILocationContextProps.md#addposition)
- [employees](ILocationContextProps.md#employees)
- [employeesDispatch](ILocationContextProps.md#employeesdispatch)
- [error](ILocationContextProps.md#error)
- [loading](ILocationContextProps.md#loading)
- [location](ILocationContextProps.md#location)
- [positions](ILocationContextProps.md#positions)
- [removePosition](ILocationContextProps.md#removeposition)
- [role](ILocationContextProps.md#role)
- [scheduleSettings](ILocationContextProps.md#schedulesettings)
- [updateLocation](ILocationContextProps.md#updatelocation)
- [updateScheduleSettings](ILocationContextProps.md#updateschedulesettings)

## Properties

### addPosition

• **addPosition**: (`position`: `string`) => `Promise`<`void`\>

#### Type declaration

▸ (`position`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `position` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/cuttinboardLocation/LocationProvider.tsx:30](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/LocationProvider.tsx#L30)

___

### employees

• **employees**: `IEmployee`[]

#### Defined in

[src/cuttinboardLocation/LocationProvider.tsx:27](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/LocationProvider.tsx#L27)

___

### employeesDispatch

• **employeesDispatch**: `Dispatch`<[`ListReducerAction`](../modules.md#listreduceraction)<`IEmployee`\>\>

#### Defined in

[src/cuttinboardLocation/LocationProvider.tsx:29](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/LocationProvider.tsx#L29)

___

### error

• `Optional` **error**: `Error`

#### Defined in

[src/cuttinboardLocation/LocationProvider.tsx:26](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/LocationProvider.tsx#L26)

___

### loading

• **loading**: `boolean`

#### Defined in

[src/cuttinboardLocation/LocationProvider.tsx:25](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/LocationProvider.tsx#L25)

___

### location

• `Optional` **location**: `ILocation`

#### Defined in

[src/cuttinboardLocation/LocationProvider.tsx:24](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/LocationProvider.tsx#L24)

___

### positions

• **positions**: `string`[]

#### Defined in

[src/cuttinboardLocation/LocationProvider.tsx:22](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/LocationProvider.tsx#L22)

___

### removePosition

• **removePosition**: (`position`: `string`) => `Promise`<`void`\>

#### Type declaration

▸ (`position`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `position` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/cuttinboardLocation/LocationProvider.tsx:31](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/LocationProvider.tsx#L31)

___

### role

• **role**: `RoleAccessLevels`

#### Defined in

[src/cuttinboardLocation/LocationProvider.tsx:23](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/LocationProvider.tsx#L23)

___

### scheduleSettings

• **scheduleSettings**: `IScheduleSettings`

#### Defined in

[src/cuttinboardLocation/LocationProvider.tsx:28](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/LocationProvider.tsx#L28)

___

### updateLocation

• **updateLocation**: (`newData`: `Partial`<`ILocation`\>) => `Promise`<`void`\>

#### Type declaration

▸ (`newData`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `newData` | `Partial`<`ILocation`\> |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/cuttinboardLocation/LocationProvider.tsx:32](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/LocationProvider.tsx#L32)

___

### updateScheduleSettings

• **updateScheduleSettings**: (`newData`: `Partial`<`IScheduleSettings`\>) => `Promise`<`void`\>

#### Type declaration

▸ (`newData`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `newData` | `Partial`<`IScheduleSettings`\> |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/cuttinboardLocation/LocationProvider.tsx:33](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/cuttinboardLocation/LocationProvider.tsx#L33)
