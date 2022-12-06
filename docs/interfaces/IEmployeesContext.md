[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / IEmployeesContext

# Interface: IEmployeesContext

## Table of contents

### Properties

- [error](IEmployeesContext.md#error)
- [getEmployeeById](IEmployeesContext.md#getemployeebyid)
- [getEmployees](IEmployeesContext.md#getemployees)
- [loading](IEmployeesContext.md#loading)

## Properties

### error

• **error**: `undefined` \| `FirestoreError`

If an error occurred while fetching the list of employees from the
Firestore database, this will contain the error object. Otherwise,
it will be `undefined`.

#### Defined in

employee/useEmployeesList.tsx:28

___

### getEmployeeById

• **getEmployeeById**: (`id`: `string`) => `undefined` \| [`Employee`](../classes/Employee.md)

#### Type declaration

▸ (`id`): `undefined` \| [`Employee`](../classes/Employee.md)

Returns the employee with the specified id from the list of employees
fetched from the Firestore database. If no employee with the specified
id exists, returns `undefined`.

##### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

##### Returns

`undefined` \| [`Employee`](../classes/Employee.md)

#### Defined in

employee/useEmployeesList.tsx:17

___

### getEmployees

• **getEmployees**: [`Employee`](../classes/Employee.md)[]

Returns the list of employees fetched from the Firestore database.

#### Defined in

employee/useEmployeesList.tsx:11

___

### loading

• **loading**: `boolean`

Indicates whether the list of employees is currently being fetched from
the Firestore database.

#### Defined in

employee/useEmployeesList.tsx:22
