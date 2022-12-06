[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / ICuttinboardUser

# Interface: ICuttinboardUser

The CuttinboardUser interface implemented by the CuttinboardUser class.

## Implemented by

- [`CuttinboardUser`](../classes/CuttinboardUser.md)

## Table of contents

### Properties

- [avatar](ICuttinboardUser.md#avatar)
- [birthDate](ICuttinboardUser.md#birthdate)
- [contactComments](ICuttinboardUser.md#contactcomments)
- [customerId](ICuttinboardUser.md#customerid)
- [email](ICuttinboardUser.md#email)
- [emergencyContact](ICuttinboardUser.md#emergencycontact)
- [lastName](ICuttinboardUser.md#lastname)
- [name](ICuttinboardUser.md#name)
- [organizations](ICuttinboardUser.md#organizations)
- [paymentMethods](ICuttinboardUser.md#paymentmethods)
- [phoneNumber](ICuttinboardUser.md#phonenumber)
- [preferredName](ICuttinboardUser.md#preferredname)
- [subscriptionId](ICuttinboardUser.md#subscriptionid)
- [userDocuments](ICuttinboardUser.md#userdocuments)

## Properties

### avatar

• `Optional` **avatar**: `string`

The avatar of the user.

#### Defined in

account/CuttinboardUser.ts:19

___

### birthDate

• `Optional` **birthDate**: `Timestamp`

The birth date of the user.

#### Defined in

account/CuttinboardUser.ts:51

___

### contactComments

• `Optional` **contactComments**: `string`

Comments about the user's contact information.

#### Defined in

account/CuttinboardUser.ts:86

___

### customerId

• `Optional` **customerId**: `string`

The ID of the customer associated with the user.

#### Defined in

account/CuttinboardUser.ts:56

___

### email

• **email**: `string`

The email of the user.

#### Defined in

account/CuttinboardUser.ts:34

___

### emergencyContact

• `Optional` **emergencyContact**: [`EmergencyContact`](../modules.md#emergencycontact)

The emergency contact information for the user.

#### Defined in

account/CuttinboardUser.ts:81

___

### lastName

• **lastName**: `string`

The last name of the user.

#### Defined in

account/CuttinboardUser.ts:29

___

### name

• **name**: `string`

The first name of the user.

#### Defined in

account/CuttinboardUser.ts:24

___

### organizations

• `Optional` **organizations**: `string`[]

A list of organizations that the user belongs to.

#### Defined in

account/CuttinboardUser.ts:71

___

### paymentMethods

• `Optional` **paymentMethods**: `string`[]

A list of payment methods associated with the user.

#### Defined in

account/CuttinboardUser.ts:66

___

### phoneNumber

• `Optional` **phoneNumber**: `string`

The phone number of the user.

#### Defined in

account/CuttinboardUser.ts:39

___

### preferredName

• `Optional` **preferredName**: `string`

The preferred name of the user.

#### Defined in

account/CuttinboardUser.ts:76

___

### subscriptionId

• `Optional` **subscriptionId**: `string`

The ID of the subscription associated with the user.

#### Defined in

account/CuttinboardUser.ts:61

___

### userDocuments

• `Optional` **userDocuments**: `Record`<`string`, `string`\>

Documents related to the user.
- The key is the name of the document.
- The value is the URL to the document.

#### Defined in

account/CuttinboardUser.ts:46
