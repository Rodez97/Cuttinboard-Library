[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / Employee

# Class: Employee

A class that represents an employee in the database.

## Implements

- [`IEmployee`](../interfaces/IEmployee.md)
- [`PrimaryFirestore`](../modules.md#primaryfirestore)
- [`FirebaseSignature`](../modules.md#firebasesignature)

## Table of contents

### Constructors

- [constructor](Employee.md#constructor)

### Properties

- [avatar](Employee.md#avatar)
- [birthDate](Employee.md#birthdate)
- [contactComments](Employee.md#contactcomments)
- [createdAt](Employee.md#createdat)
- [createdBy](Employee.md#createdby)
- [docRef](Employee.md#docref)
- [email](Employee.md#email)
- [emergencyContact](Employee.md#emergencycontact)
- [id](Employee.md#id)
- [lastName](Employee.md#lastname)
- [locationId](Employee.md#locationid)
- [locations](Employee.md#locations)
- [name](Employee.md#name)
- [organizationId](Employee.md#organizationid)
- [phoneNumber](Employee.md#phonenumber)
- [preferredName](Employee.md#preferredname)
- [role](Employee.md#role)
- [supervisingLocations](Employee.md#supervisinglocations)
- [userDocuments](Employee.md#userdocuments)
- [firestoreConverter](Employee.md#firestoreconverter)

### Accessors

- [fullName](Employee.md#fullname)
- [locationData](Employee.md#locationdata)
- [locationRole](Employee.md#locationrole)
- [mainPosition](Employee.md#mainposition)
- [positions](Employee.md#positions)

### Methods

- [delete](Employee.md#delete)
- [getHourlyWage](Employee.md#gethourlywage)
- [hasAnyPosition](Employee.md#hasanyposition)
- [update](Employee.md#update)

## Constructors

### constructor

• **new Employee**(`data`, `firestoreBase`, `locationId?`)

Creates a new Employee instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`IEmployee`](../interfaces/IEmployee.md) & [`FirebaseSignature`](../modules.md#firebasesignature)<`Timestamp`\> | The data to create the employee from. |
| `firestoreBase` | [`PrimaryFirestore`](../modules.md#primaryfirestore) | The id and document reference of the employee. |
| `locationId?` | `string` | The ID of the location to assign the employee to. If not provided, the employee will be assigned to the location selected in `globalThis` if there is one. |

#### Defined in

employee/Employee.ts:161

## Properties

### avatar

• `Optional` `Readonly` **avatar**: `string`

{@inheritDoc BaseUser.avatar}

#### Implementation of

[IEmployee](../interfaces/IEmployee.md).[avatar](../interfaces/IEmployee.md#avatar)

#### Defined in

employee/Employee.ts:77

___

### birthDate

• `Optional` `Readonly` **birthDate**: `Timestamp`

{@inheritDoc BaseUser.birthDate}

#### Implementation of

[IEmployee](../interfaces/IEmployee.md).[birthDate](../interfaces/IEmployee.md#birthdate)

#### Defined in

employee/Employee.ts:93

___

### contactComments

• `Optional` `Readonly` **contactComments**: `string`

{@inheritDoc BaseUser.contactComments}

#### Implementation of

[IEmployee](../interfaces/IEmployee.md).[contactComments](../interfaces/IEmployee.md#contactcomments)

#### Defined in

employee/Employee.ts:130

___

### createdAt

• `Readonly` **createdAt**: `Timestamp`

{@inheritDoc FirebaseSignature.createdAt}

#### Implementation of

FirebaseSignature.createdAt

#### Defined in

employee/Employee.ts:68

___

### createdBy

• `Readonly` **createdBy**: `string`

{@inheritDoc FirebaseSignature.createdBy}

#### Implementation of

FirebaseSignature.createdBy

#### Defined in

employee/Employee.ts:72

___

### docRef

• `Readonly` **docRef**: `DocumentReference`<`DocumentData`\>

{@inheritDoc PrimaryFirestore.docRef}

#### Implementation of

PrimaryFirestore.docRef

#### Defined in

employee/Employee.ts:63

___

### email

• `Readonly` **email**: `string`

{@inheritDoc BaseUser.email}

#### Implementation of

[IEmployee](../interfaces/IEmployee.md).[email](../interfaces/IEmployee.md#email)

#### Defined in

employee/Employee.ts:89

___

### emergencyContact

• `Optional` `Readonly` **emergencyContact**: [`EmergencyContact`](../modules.md#emergencycontact)

{@inheritDoc BaseUser.emergencyContact}

#### Implementation of

[IEmployee](../interfaces/IEmployee.md).[emergencyContact](../interfaces/IEmployee.md#emergencycontact)

#### Defined in

employee/Employee.ts:126

___

### id

• `Readonly` **id**: `string`

{@inheritDoc PrimaryFirestore.id}

#### Implementation of

PrimaryFirestore.id

#### Defined in

employee/Employee.ts:59

___

### lastName

• `Readonly` **lastName**: `string`

{@inheritDoc BaseUser.lastName}

#### Implementation of

[IEmployee](../interfaces/IEmployee.md).[lastName](../interfaces/IEmployee.md#lastname)

#### Defined in

employee/Employee.ts:85

___

### locationId

• `Optional` `Readonly` **locationId**: `string`

The id of the location that the user is currently working at.

#### Defined in

employee/Employee.ts:138

___

### locations

• `Optional` `Readonly` **locations**: `Object`

Information about the locations where the employee works.
- The key is the location ID.
- The value is either a boolean indicating whether the employee works at the location,
  or an object containing additional details about the employee's work at the location.

#### Index signature

▪ [locationId: `string`]: `boolean` \| [`EmployeeLocationInfo`](../modules.md#employeelocationinfo)

#### Implementation of

[IEmployee](../interfaces/IEmployee.md).[locations](../interfaces/IEmployee.md#locations)

#### Defined in

employee/Employee.ts:116

___

### name

• `Readonly` **name**: `string`

{@inheritDoc BaseUser.name}

#### Implementation of

[IEmployee](../interfaces/IEmployee.md).[name](../interfaces/IEmployee.md#name)

#### Defined in

employee/Employee.ts:81

___

### organizationId

• `Readonly` **organizationId**: `string`

The ID of the organization that the employee belongs to.

#### Implementation of

[IEmployee](../interfaces/IEmployee.md).[organizationId](../interfaces/IEmployee.md#organizationid)

#### Defined in

employee/Employee.ts:105

___

### phoneNumber

• `Optional` `Readonly` **phoneNumber**: `string`

{@inheritDoc BaseUser.phoneNumber}

#### Implementation of

[IEmployee](../interfaces/IEmployee.md).[phoneNumber](../interfaces/IEmployee.md#phonenumber)

#### Defined in

employee/Employee.ts:97

___

### preferredName

• `Optional` `Readonly` **preferredName**: `string`

{@inheritDoc BaseUser.preferredName}

#### Implementation of

[IEmployee](../interfaces/IEmployee.md).[preferredName](../interfaces/IEmployee.md#preferredname)

#### Defined in

employee/Employee.ts:122

___

### role

• `Readonly` **role**: [`OWNER`](../enums/RoleAccessLevels.md#owner) \| [`ADMIN`](../enums/RoleAccessLevels.md#admin) \| ``"employee"``

The role of the employee.
- "employee" is the only role assigned to employees with roles <= `GENERAL_MANAGER`.
- `OWNER` and `ADMIN` are assigned to organization level roles.

#### Implementation of

[IEmployee](../interfaces/IEmployee.md).[role](../interfaces/IEmployee.md#role)

#### Defined in

employee/Employee.ts:109

___

### supervisingLocations

• `Optional` `Readonly` **supervisingLocations**: `string`[]

A list of location IDs where the employee is a supervisor.

#### Implementation of

[IEmployee](../interfaces/IEmployee.md).[supervisingLocations](../interfaces/IEmployee.md#supervisinglocations)

#### Defined in

employee/Employee.ts:134

___

### userDocuments

• `Optional` `Readonly` **userDocuments**: `Record`<`string`, `string`\>

{@inheritDoc BaseUser.userDocuments}

#### Implementation of

[IEmployee](../interfaces/IEmployee.md).[userDocuments](../interfaces/IEmployee.md#userdocuments)

#### Defined in

employee/Employee.ts:101

___

### firestoreConverter

▪ `Static` **firestoreConverter**: `FirestoreDataConverter`<[`Employee`](Employee.md)\>

#### Defined in

employee/Employee.ts:140

## Accessors

### fullName

• `get` **fullName**(): `string`

Gets the full name of the employee.

#### Returns

`string`

#### Defined in

employee/Employee.ts:211

___

### locationData

• `get` **locationData**(): ``null`` \| [`EmployeeLocationInfo`](../modules.md#employeelocationinfo)

Gets all the location data for the employee for the current location.

#### Returns

``null`` \| [`EmployeeLocationInfo`](../modules.md#employeelocationinfo)

#### Defined in

employee/Employee.ts:277

___

### locationRole

• `get` **locationRole**(): ``null`` \| [`RoleAccessLevels`](../enums/RoleAccessLevels.md)

Get the role of the employee for the current location.
- If the employee is not assigned to any location, it will return null.
- For organization level roles, it will return the role.

#### Returns

``null`` \| [`RoleAccessLevels`](../enums/RoleAccessLevels.md)

#### Defined in

employee/Employee.ts:260

___

### mainPosition

• `get` **mainPosition**(): `string`

Gets the preferred position for this employee.
- If the employee is not assigned to any location, it will return an empty string.
- For organization level roles, it will return an empty string.

#### Returns

`string`

#### Defined in

employee/Employee.ts:240

___

### positions

• `get` **positions**(): `string`[]

Gets the positions of the employee for the current location.
- If the employee is not assigned to any location, it will return an empty array.
- For organization level roles, it will return an empty array.

#### Returns

`string`[]

#### Defined in

employee/Employee.ts:220

## Methods

### delete

▸ **delete**(): `Promise`<`void`\>

Removes the employee from the current location.

**`Remarks`**

- For organization level roles, it will remove only the location for the record of locations.
- For employee level roles, it will remove the employee from the location, but if it is the last location, it will remove the employee from the organization.

#### Returns

`Promise`<`void`\>

#### Defined in

employee/Employee.ts:324

___

### getHourlyWage

▸ **getHourlyWage**(`position`): `number`

Calculates the hourly wage for the employee for a given position.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `position` | `string` | The position to check. |

#### Returns

`number`

#### Defined in

employee/Employee.ts:296

___

### hasAnyPosition

▸ **hasAnyPosition**(`positions`): `boolean`

Checks if the employee have at least one of the positions.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `positions` | `string`[] | The positions to check. |

#### Returns

`boolean`

#### Defined in

employee/Employee.ts:314

___

### update

▸ **update**(`locationData`): `Promise`<`void`\>

Updates the employee data for the current location.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `locationData` | `PartialWithFieldValue`<[`EmployeeLocationInfo`](../modules.md#employeelocationinfo)\> | The data to update. |

#### Returns

`Promise`<`void`\>

#### Defined in

employee/Employee.ts:349
