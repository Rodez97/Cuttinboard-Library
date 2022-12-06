[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / Location

# Class: Location

The Location is the representation of a location in the database.
- This is the main class used to interact with the database.

## Implements

- [`ILocation`](../interfaces/ILocation.md)
- [`PrimaryFirestore`](../modules.md#primaryfirestore)
- [`FirebaseSignature`](../modules.md#firebasesignature)

## Table of contents

### Constructors

- [constructor](Location.md#constructor)

### Properties

- [address](Location.md#address)
- [createdAt](Location.md#createdat)
- [createdBy](Location.md#createdby)
- [description](Location.md#description)
- [docRef](Location.md#docref)
- [email](Location.md#email)
- [id](Location.md#id)
- [intId](Location.md#intid)
- [limits](Location.md#limits)
- [members](Location.md#members)
- [name](Location.md#name)
- [organizationId](Location.md#organizationid)
- [phoneNumber](Location.md#phonenumber)
- [settings](Location.md#settings)
- [storageUsed](Location.md#storageused)
- [subItemId](Location.md#subitemid)
- [subscriptionId](Location.md#subscriptionid)
- [subscriptionStatus](Location.md#subscriptionstatus)
- [supervisors](Location.md#supervisors)
- [firestoreConverter](Location.md#firestoreconverter)

### Accessors

- [employeesRef](Location.md#employeesref)
- [locationAccessStatus](Location.md#locationaccessstatus)
- [positions](Location.md#positions)
- [storageRef](Location.md#storageref)
- [usage](Location.md#usage)

### Methods

- [addPosition](Location.md#addposition)
- [ownerJoin](Location.md#ownerjoin)
- [removePosition](Location.md#removeposition)
- [supervisorJoin](Location.md#supervisorjoin)
- [updateLocation](Location.md#updatelocation)

## Constructors

### constructor

• **new Location**(`data`, `firestoreBase`)

Creates a new Location instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | [`ILocation`](../interfaces/ILocation.md) & [`FirebaseSignature`](../modules.md#firebasesignature)<`Timestamp`\> | The data to create the location with. |
| `firestoreBase` | [`PrimaryFirestore`](../modules.md#primaryfirestore) | The id and docRef of the location. |

#### Defined in

[models/Location.ts:227](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L227)

## Properties

### address

• `Optional` `Readonly` **address**: `Partial`<{ `city`: `string` ; `country`: `string` ; `state`: `string` ; `street`: `string` ; `streetNumber`: `string` ; `zip`: `string` \| `number`  }\>

The address of the location.

#### Implementation of

[ILocation](../interfaces/ILocation.md).[address](../interfaces/ILocation.md#address)

#### Defined in

[models/Location.ts:146](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L146)

___

### createdAt

• `Readonly` **createdAt**: `Timestamp`

The timestamp of when the document was created.

#### Implementation of

FirebaseSignature.createdAt

#### Defined in

[models/Location.ts:80](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L80)

___

### createdBy

• `Readonly` **createdBy**: `string`

The id of the user who created the document.

#### Implementation of

FirebaseSignature.createdBy

#### Defined in

[models/Location.ts:84](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L84)

___

### description

• `Optional` `Readonly` **description**: `string`

The description of the location.

#### Implementation of

[ILocation](../interfaces/ILocation.md).[description](../interfaces/ILocation.md#description)

#### Defined in

[models/Location.ts:142](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L142)

___

### docRef

• `Readonly` **docRef**: `DocumentReference`<`DocumentData`\>

The reference to the document in the database.

#### Implementation of

PrimaryFirestore.docRef

#### Defined in

[models/Location.ts:76](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L76)

___

### email

• `Optional` `Readonly` **email**: `string`

The email of the location. This is used for contact purposes.

#### Implementation of

[ILocation](../interfaces/ILocation.md).[email](../interfaces/ILocation.md#email)

#### Defined in

[models/Location.ts:177](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L177)

___

### id

• `Readonly` **id**: `string`

The id of the document.

#### Implementation of

PrimaryFirestore.id

#### Defined in

[models/Location.ts:72](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L72)

___

### intId

• `Optional` `Readonly` **intId**: `string`

An optional field used to identify the location internally in the organization.

#### Implementation of

[ILocation](../interfaces/ILocation.md).[intId](../interfaces/ILocation.md#intid)

#### Defined in

[models/Location.ts:185](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L185)

___

### limits

• `Readonly` **limits**: `Object`

The limits of the plan for the location.
- This is used to determine if the location is over their employee limit.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `employees` | `number` | The number of employees allowed for the location. |
| `storage` | `string` | The amount of storage allowed for the location in bytes. |

#### Implementation of

[ILocation](../interfaces/ILocation.md).[limits](../interfaces/ILocation.md#limits)

#### Defined in

[models/Location.ts:109](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L109)

___

### members

• `Readonly` **members**: `string`[]

The ids of the members of the location.

#### Implementation of

[ILocation](../interfaces/ILocation.md).[members](../interfaces/ILocation.md#members)

#### Defined in

[models/Location.ts:189](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L189)

___

### name

• `Readonly` **name**: `string`

The name of the location.

#### Implementation of

[ILocation](../interfaces/ILocation.md).[name](../interfaces/ILocation.md#name)

#### Defined in

[models/Location.ts:138](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L138)

___

### organizationId

• `Readonly` **organizationId**: `string`

The id of the organization the location belongs to.

#### Implementation of

[ILocation](../interfaces/ILocation.md).[organizationId](../interfaces/ILocation.md#organizationid)

#### Defined in

[models/Location.ts:122](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L122)

___

### phoneNumber

• `Optional` `Readonly` **phoneNumber**: `string`

The phone number of the location. This is used for contact purposes.

#### Implementation of

[ILocation](../interfaces/ILocation.md).[phoneNumber](../interfaces/ILocation.md#phonenumber)

#### Defined in

[models/Location.ts:181](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L181)

___

### settings

• `Optional` `Readonly` **settings**: `Object`

Settings is used to store simple data that is used by the location.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `positions?` | `string`[] | Custom positions for the location added by the user. |

#### Implementation of

[ILocation](../interfaces/ILocation.md).[settings](../interfaces/ILocation.md#settings)

#### Defined in

[models/Location.ts:197](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L197)

___

### storageUsed

• `Readonly` **storageUsed**: `number`

The space used by the location in cloud storage in bytes.
- This is used to determine if the location is over their storage limit.

**`See`**

https://firebase.google.com/docs/storage

#### Implementation of

[ILocation](../interfaces/ILocation.md).[storageUsed](../interfaces/ILocation.md#storageused)

#### Defined in

[models/Location.ts:104](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L104)

___

### subItemId

• `Readonly` **subItemId**: `string`

The subscription item id for the location in Stripe.

**`Remarks`**

Subscription item id is the same for all locations in an organization.

#### Implementation of

[ILocation](../interfaces/ILocation.md).[subItemId](../interfaces/ILocation.md#subitemid)

#### Defined in

[models/Location.ts:134](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L134)

___

### subscriptionId

• `Readonly` **subscriptionId**: `string`

The subscription id for the location in Stripe.

**`Remarks`**

Subscription id is the same for all locations in an organization.

#### Implementation of

[ILocation](../interfaces/ILocation.md).[subscriptionId](../interfaces/ILocation.md#subscriptionid)

#### Defined in

[models/Location.ts:128](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L128)

___

### subscriptionStatus

• `Readonly` **subscriptionStatus**: ``"active"`` \| ``"canceled"`` \| ``"incomplete"`` \| ``"incomplete_expired"`` \| ``"past_due"`` \| ``"trialing"`` \| ``"unpaid"``

The status of the subscription for the location in Stripe.
- This is used to determine if the location is active or not.
- This status is the same for all locations in the organization.

**`See`**

https://stripe.com/docs/api/subscriptions/object#subscription_object-status

#### Implementation of

[ILocation](../interfaces/ILocation.md).[subscriptionStatus](../interfaces/ILocation.md#subscriptionstatus)

#### Defined in

[models/Location.ts:91](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L91)

___

### supervisors

• `Optional` `Readonly` **supervisors**: `string`[]

The ids of the supervisors of the location.

#### Implementation of

[ILocation](../interfaces/ILocation.md).[supervisors](../interfaces/ILocation.md#supervisors)

#### Defined in

[models/Location.ts:193](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L193)

___

### firestoreConverter

▪ `Static` **firestoreConverter**: `Object`

Firestore data converter for the Location class.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fromFirestore` | (`value`: `QueryDocumentSnapshot`<[`ILocation`](../interfaces/ILocation.md) & [`FirebaseSignature`](../modules.md#firebasesignature)<`Timestamp`\>\>, `options`: `SnapshotOptions`) => [`Location`](Location.md) |
| `toFirestore` | (`object`: [`Location`](Location.md)) => `DocumentData` |

#### Defined in

[models/Location.ts:207](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L207)

## Accessors

### employeesRef

• `get` **employeesRef**(): `Query`<[`Employee`](Employee.md)\>

Gets the employees reference for the location in firestore.

#### Returns

`Query`<[`Employee`](Employee.md)\>

#### Defined in

[models/Location.ts:290](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L290)

___

### locationAccessStatus

• `get` **locationAccessStatus**(): ``"inactive"`` \| ``"error"`` \| ``"canceled"`` \| ``"active"``

Gets the access status of the location based on the subscription status.

#### Returns

``"inactive"`` \| ``"error"`` \| ``"canceled"`` \| ``"active"``

#### Defined in

[models/Location.ts:317](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L317)

___

### positions

• `get` **positions**(): `string`[]

Gets the custom positions for the location.

#### Returns

`string`[]

#### Defined in

[models/Location.ts:273](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L273)

___

### storageRef

• `get` **storageRef**(): `StorageReference`

Gets the cloud storage reference for the location.

#### Returns

`StorageReference`

#### Defined in

[models/Location.ts:280](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L280)

___

### usage

• `get` **usage**(): `Object`

Gets the current usage of the location and the limits.

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `employeesCount` | `number` |
| `employeesLimit` | `number` |
| `storageLimit` | `number` |
| `storageUsed` | `number` |

#### Defined in

[models/Location.ts:305](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L305)

## Methods

### addPosition

▸ **addPosition**(`newPosition`): `Promise`<`void`\>

Adds a new custom position to the location settings.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `newPosition` | `string` | The new position to add to the location. |

#### Returns

`Promise`<`void`\>

#### Defined in

[models/Location.ts:334](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L334)

___

### ownerJoin

▸ **ownerJoin**(`join?`): `Promise`<`void`\>

If the user is the owner of the location. This method allows the user to join/leave the location as a member.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `join?` | `boolean` | True to join the location, false to leave the location. |

#### Returns

`Promise`<`void`\>

#### Defined in

[models/Location.ts:366](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L366)

___

### removePosition

▸ **removePosition**(`position`): `Promise`<`void`\>

Removes a custom position from the location settings.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `position` | `string` | The position to remove from the location. |

#### Returns

`Promise`<`void`\>

#### Defined in

[models/Location.ts:346](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L346)

___

### supervisorJoin

▸ **supervisorJoin**(`join?`): `Promise`<`void`\>

If the user is a supervisor of the location. This method allows the user to join/leave the location as a member.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `join?` | `boolean` | True to join the location, false to leave the location. |

#### Returns

`Promise`<`void`\>

#### Defined in

[models/Location.ts:389](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L389)

___

### updateLocation

▸ **updateLocation**(`newData`): `Promise`<`void`\>

Updates the location with the new data.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `newData` | `Partial`<[`ILocation`](../interfaces/ILocation.md)\> | The new data to update the location with. |

#### Returns

`Promise`<`void`\>

#### Defined in

[models/Location.ts:358](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/8f7247f/src/models/Location.ts#L358)
