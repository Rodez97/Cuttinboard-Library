[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / IEmployeeShifts

# Interface: IEmployeeShifts

An interface that defines the properties of an object representing the shifts for a specific employee in a given week.

## Implemented by

- [`EmployeeShifts`](../classes/EmployeeShifts.md)

## Table of contents

### Properties

- [employeeId](IEmployeeShifts.md#employeeid)
- [locationId](IEmployeeShifts.md#locationid)
- [shifts](IEmployeeShifts.md#shifts)
- [updatedAt](IEmployeeShifts.md#updatedat)
- [weekId](IEmployeeShifts.md#weekid)

## Properties

### employeeId

• **employeeId**: `string`

The ID of the employee.

#### Defined in

schedule/EmployeeShifts.ts:42

___

### locationId

• **locationId**: `string`

The ID of the location where the employee works.

#### Defined in

schedule/EmployeeShifts.ts:54

___

### shifts

• `Optional` **shifts**: `Record`<`string`, [`Shift`](../classes/Shift.md)\>

An optional record containing the shifts for the employee. The keys of the record are the shift IDs and the values are the Shift objects.

#### Defined in

schedule/EmployeeShifts.ts:38

___

### updatedAt

• **updatedAt**: `Timestamp`

A timestamp representing the last time the shifts were updated.

#### Defined in

schedule/EmployeeShifts.ts:50

___

### weekId

• **weekId**: `string`

The ID of the week.

#### Defined in

schedule/EmployeeShifts.ts:46
