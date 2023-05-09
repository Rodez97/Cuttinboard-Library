[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / <internal\>

# Module: <internal\>

## Table of contents

### Type Aliases

- [EmployeeData](internal_-4.md#employeedata)

## Type Aliases

### EmployeeData

Ƭ **EmployeeData**: `Object`

Type for employee data

#### Type declaration

| Name | Type |
| :------ | :------ |
| `email` | `string` |
| `lastName` | `string` |
| `locationId` | `string` |
| `mainPosition` | `string` |
| `name` | `string` |
| `permissions?` | `ManagerPermissions` |
| `positions` | `string`[] |
| `role` | `RoleAccessLevels.GENERAL_MANAGER` \| `RoleAccessLevels.MANAGER` \| `RoleAccessLevels.STAFF` |
| `wagePerPosition` | `Record`<`string`, `number`\> |

#### Defined in

[src/employee/useAddEmployee.tsx:15](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/employee/useAddEmployee.tsx#L15)
