[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / CuttinboardUser

# Class: CuttinboardUser

A CuttinboardUser is the base user model for Cuttinboard.

## Implements

- [`ICuttinboardUser`](../interfaces/ICuttinboardUser.md)
- [`PrimaryFirestore`](../modules.md#primaryfirestore)

## Table of contents

### Constructors

- [constructor](CuttinboardUser.md#constructor)

### Properties

- [avatar](CuttinboardUser.md#avatar)
- [birthDate](CuttinboardUser.md#birthdate)
- [contactComments](CuttinboardUser.md#contactcomments)
- [customerId](CuttinboardUser.md#customerid)
- [docRef](CuttinboardUser.md#docref)
- [email](CuttinboardUser.md#email)
- [emergencyContact](CuttinboardUser.md#emergencycontact)
- [id](CuttinboardUser.md#id)
- [lastName](CuttinboardUser.md#lastname)
- [name](CuttinboardUser.md#name)
- [organizations](CuttinboardUser.md#organizations)
- [paymentMethods](CuttinboardUser.md#paymentmethods)
- [phoneNumber](CuttinboardUser.md#phonenumber)
- [preferredName](CuttinboardUser.md#preferredname)
- [subscriptionId](CuttinboardUser.md#subscriptionid)
- [userDocuments](CuttinboardUser.md#userdocuments)
- [firestoreConverter](CuttinboardUser.md#firestoreconverter)

## Constructors

### constructor

• **new CuttinboardUser**(`data`, `firestoreBase`)

Creates a new instance of the CuttinboardUser class.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`ICuttinboardUser`](../interfaces/ICuttinboardUser.md) | The data to create the CuttinboardUser with. |
| `firestoreBase` | [`PrimaryFirestore`](../modules.md#primaryfirestore) | (id, docRef) - The Firestore data for the user. |

#### Defined in

account/CuttinboardUser.ts:178

## Properties

### avatar

• `Optional` `Readonly` **avatar**: `string`

The avatar of the user.

#### Implementation of

[ICuttinboardUser](../interfaces/ICuttinboardUser.md).[avatar](../interfaces/ICuttinboardUser.md#avatar)

#### Defined in

account/CuttinboardUser.ts:104

___

### birthDate

• `Optional` `Readonly` **birthDate**: `Timestamp`

The birth date of the user.

#### Implementation of

[ICuttinboardUser](../interfaces/ICuttinboardUser.md).[birthDate](../interfaces/ICuttinboardUser.md#birthdate)

#### Defined in

account/CuttinboardUser.ts:128

___

### contactComments

• `Optional` `Readonly` **contactComments**: `string`

Comments about the user's contact information.

#### Implementation of

[ICuttinboardUser](../interfaces/ICuttinboardUser.md).[contactComments](../interfaces/ICuttinboardUser.md#contactcomments)

#### Defined in

account/CuttinboardUser.ts:156

___

### customerId

• `Optional` `Readonly` **customerId**: `string`

The ID of the customer associated with the user.

#### Implementation of

[ICuttinboardUser](../interfaces/ICuttinboardUser.md).[customerId](../interfaces/ICuttinboardUser.md#customerid)

#### Defined in

account/CuttinboardUser.ts:132

___

### docRef

• `Readonly` **docRef**: `DocumentReference`<`DocumentData`\>

{@inheritDoc PrimaryFirestore.docRef}

#### Implementation of

PrimaryFirestore.docRef

#### Defined in

account/CuttinboardUser.ts:100

___

### email

• `Readonly` **email**: `string`

The email of the user.

#### Implementation of

[ICuttinboardUser](../interfaces/ICuttinboardUser.md).[email](../interfaces/ICuttinboardUser.md#email)

#### Defined in

account/CuttinboardUser.ts:116

___

### emergencyContact

• `Optional` `Readonly` **emergencyContact**: [`EmergencyContact`](../modules.md#emergencycontact)

The emergency contact information for the user.

#### Implementation of

[ICuttinboardUser](../interfaces/ICuttinboardUser.md).[emergencyContact](../interfaces/ICuttinboardUser.md#emergencycontact)

#### Defined in

account/CuttinboardUser.ts:152

___

### id

• `Readonly` **id**: `string`

{@inheritDoc PrimaryFirestore.id}

#### Implementation of

PrimaryFirestore.id

#### Defined in

account/CuttinboardUser.ts:96

___

### lastName

• `Readonly` **lastName**: `string`

The last name of the user.

#### Implementation of

[ICuttinboardUser](../interfaces/ICuttinboardUser.md).[lastName](../interfaces/ICuttinboardUser.md#lastname)

#### Defined in

account/CuttinboardUser.ts:112

___

### name

• `Readonly` **name**: `string`

The first name of the user.

#### Implementation of

[ICuttinboardUser](../interfaces/ICuttinboardUser.md).[name](../interfaces/ICuttinboardUser.md#name)

#### Defined in

account/CuttinboardUser.ts:108

___

### organizations

• `Optional` `Readonly` **organizations**: `string`[]

A list of organizations that the user belongs to.

#### Implementation of

[ICuttinboardUser](../interfaces/ICuttinboardUser.md).[organizations](../interfaces/ICuttinboardUser.md#organizations)

#### Defined in

account/CuttinboardUser.ts:144

___

### paymentMethods

• `Optional` `Readonly` **paymentMethods**: `string`[]

A list of payment methods associated with the user.

#### Implementation of

[ICuttinboardUser](../interfaces/ICuttinboardUser.md).[paymentMethods](../interfaces/ICuttinboardUser.md#paymentmethods)

#### Defined in

account/CuttinboardUser.ts:140

___

### phoneNumber

• `Optional` `Readonly` **phoneNumber**: `string`

The phone number of the user.

#### Implementation of

[ICuttinboardUser](../interfaces/ICuttinboardUser.md).[phoneNumber](../interfaces/ICuttinboardUser.md#phonenumber)

#### Defined in

account/CuttinboardUser.ts:120

___

### preferredName

• `Optional` `Readonly` **preferredName**: `string`

The preferred name of the user.

#### Implementation of

[ICuttinboardUser](../interfaces/ICuttinboardUser.md).[preferredName](../interfaces/ICuttinboardUser.md#preferredname)

#### Defined in

account/CuttinboardUser.ts:148

___

### subscriptionId

• `Optional` `Readonly` **subscriptionId**: `string`

The ID of the subscription associated with the user.

#### Implementation of

[ICuttinboardUser](../interfaces/ICuttinboardUser.md).[subscriptionId](../interfaces/ICuttinboardUser.md#subscriptionid)

#### Defined in

account/CuttinboardUser.ts:136

___

### userDocuments

• `Optional` `Readonly` **userDocuments**: `Record`<`string`, `string`\>

Documents related to the user.
- The key is the name of the document.
- The value is the URL to the document.

#### Implementation of

[ICuttinboardUser](../interfaces/ICuttinboardUser.md).[userDocuments](../interfaces/ICuttinboardUser.md#userdocuments)

#### Defined in

account/CuttinboardUser.ts:124

___

### firestoreConverter

▪ `Static` **firestoreConverter**: `FirestoreDataConverter`<[`CuttinboardUser`](CuttinboardUser.md)\>

#### Defined in

account/CuttinboardUser.ts:158
