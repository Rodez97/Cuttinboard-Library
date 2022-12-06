[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / RoleAccessLevels

# Enumeration: RoleAccessLevels

Access roles for an employee in an organization or a location.

## Table of contents

### Enumeration Members

- [ADMIN](RoleAccessLevels.md#admin)
- [GENERAL\_MANAGER](RoleAccessLevels.md#general_manager)
- [MANAGER](RoleAccessLevels.md#manager)
- [OWNER](RoleAccessLevels.md#owner)
- [STAFF](RoleAccessLevels.md#staff)

## Enumeration Members

### ADMIN

• **ADMIN** = ``1``

Admin role is used for employees are supervisors of locations.
- Has full access to all the locations they are supervisors of.

#### Defined in

[utils/RoleAccessLevels.ts:14](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/utils/RoleAccessLevels.ts#L14)

___

### GENERAL\_MANAGER

• **GENERAL\_MANAGER** = ``2``

General manager role is used for employees that are the general managers of locations.
- Has full access to the location they are the general manager of.

#### Defined in

[utils/RoleAccessLevels.ts:19](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/utils/RoleAccessLevels.ts#L19)

___

### MANAGER

• **MANAGER** = ``3``

Managers are intermediate level employees that have higher access than regular employees.
- They can do everything that regular employees can do, but they can also do some things that regular employees can't do.

#### Defined in

[utils/RoleAccessLevels.ts:24](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/utils/RoleAccessLevels.ts#L24)

___

### OWNER

• **OWNER** = ``0``

The owner of the organization.
- Has full access to the organization and all of its locations.

#### Defined in

[utils/RoleAccessLevels.ts:9](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/utils/RoleAccessLevels.ts#L9)

___

### STAFF

• **STAFF** = ``4``

Regular employees are the lowest level employees.

#### Defined in

[utils/RoleAccessLevels.ts:28](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/utils/RoleAccessLevels.ts#L28)
