[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / IEmployee

# Interface: IEmployee

Employee interface implemented by Employee class.

## Hierarchy

- [`BaseUser`](../modules.md#baseuser)

  ↳ **`IEmployee`**

## Implemented by

- [`Employee`](../classes/Employee.md)

## Table of contents

### Properties

- [avatar](IEmployee.md#avatar)
- [birthDate](IEmployee.md#birthdate)
- [contactComments](IEmployee.md#contactcomments)
- [email](IEmployee.md#email)
- [emergencyContact](IEmployee.md#emergencycontact)
- [lastName](IEmployee.md#lastname)
- [locations](IEmployee.md#locations)
- [name](IEmployee.md#name)
- [organizationId](IEmployee.md#organizationid)
- [phoneNumber](IEmployee.md#phonenumber)
- [preferredName](IEmployee.md#preferredname)
- [role](IEmployee.md#role)
- [supervisingLocations](IEmployee.md#supervisinglocations)
- [userDocuments](IEmployee.md#userdocuments)

## Properties

### avatar

• `Optional` **avatar**: `string`

The avatar of the user.

#### Inherited from

BaseUser.avatar

#### Defined in

account/CuttinboardUser.ts:19

___

### birthDate

• `Optional` **birthDate**: `Timestamp`

The birth date of the user.

#### Inherited from

BaseUser.birthDate

#### Defined in

account/CuttinboardUser.ts:51

___

### contactComments

• `Optional` **contactComments**: `string`

Comments about the user's contact information.

#### Inherited from

BaseUser.contactComments

#### Defined in

account/CuttinboardUser.ts:86

___

### email

• **email**: `string`

The email of the user.

#### Inherited from

BaseUser.email

#### Defined in

account/CuttinboardUser.ts:34

___

### emergencyContact

• `Optional` **emergencyContact**: [`EmergencyContact`](../modules.md#emergencycontact)

The emergency contact information for the user.

#### Inherited from

BaseUser.emergencyContact

#### Defined in

account/CuttinboardUser.ts:81

___

### lastName

• **lastName**: `string`

The last name of the user.

#### Inherited from

BaseUser.lastName

#### Defined in

account/CuttinboardUser.ts:29

___

### locations

• `Optional` **locations**: `Object`

Information about the locations where the employee works.
- The key is the location ID.
- The value is either a boolean indicating whether the employee works at the location,
  or an object containing additional details about the employee's work at the location.

#### Index signature

▪ [locationId: `string`]: `boolean` \| [`EmployeeLocationInfo`](../modules.md#employeelocationinfo)

#### Defined in

employee/Employee.ts:43

___

### name

• **name**: `string`

The first name of the user.

#### Inherited from

BaseUser.name

#### Defined in

account/CuttinboardUser.ts:24

___

### organizationId

• **organizationId**: `string`

The ID of the organization that the employee belongs to.

#### Defined in

employee/Employee.ts:29

___

### phoneNumber

• `Optional` **phoneNumber**: `string`

The phone number of the user.

#### Inherited from

BaseUser.phoneNumber

#### Defined in

account/CuttinboardUser.ts:39

___

### preferredName

• `Optional` **preferredName**: `string`

The preferred name of the user.

#### Inherited from

BaseUser.preferredName

#### Defined in

account/CuttinboardUser.ts:76

___

### role

• **role**: [`OWNER`](../enums/RoleAccessLevels.md#owner) \| [`ADMIN`](../enums/RoleAccessLevels.md#admin) \| ``"employee"``

The role of the employee.
- "employee" is the only role assigned to employees with roles <= `GENERAL_MANAGER`.
- `OWNER` and `ADMIN` are assigned to organization level roles.

**`See`**

[RoleAccessLevels](../enums/RoleAccessLevels.md)

#### Defined in

employee/Employee.ts:36

___

### supervisingLocations

• `Optional` **supervisingLocations**: `string`[]

A list of location IDs where the employee is a supervisor.

#### Defined in

employee/Employee.ts:47

___

### userDocuments

• `Optional` **userDocuments**: `Record`<`string`, `string`\>

Documents related to the user.
- The key is the name of the document.
- The value is the URL to the document.

#### Inherited from

BaseUser.userDocuments

#### Defined in

account/CuttinboardUser.ts:46
