[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / Product

# Interface: Product

## Indexable

▪ [propName: `string`]: `unknown`

## Table of contents

### Properties

- [active](Product.md#active)
- [description](Product.md#description)
- [images](Product.md#images)
- [name](Product.md#name)
- [prices](Product.md#prices)
- [role](Product.md#role)

## Properties

### active

• **active**: `boolean`

Whether the product is currently available for purchase.

#### Defined in

billing/Product.ts:7

___

### description

• **description**: ``null`` \| `string`

The product's description, meant to be displayable to the customer. Use this field to optionally store a long form explanation of the product being sold for your own rendering purposes.

#### Defined in

billing/Product.ts:15

___

### images

• **images**: `string`[]

A list of up to 8 URLs of images for this product, meant to be displayable to the customer.

#### Defined in

billing/Product.ts:23

___

### name

• **name**: `string`

The product's name, meant to be displayable to the customer. Whenever this product is sold via a subscription, name will show up on associated invoice line item descriptions.

#### Defined in

billing/Product.ts:11

___

### prices

• `Optional` **prices**: [`Price`](Price.md)[]

A list of Prices for this billing product.

#### Defined in

billing/Product.ts:27

___

### role

• **role**: ``null`` \| `string`

The role that will be assigned to the user if they are subscribed to this plan.

#### Defined in

billing/Product.ts:19
