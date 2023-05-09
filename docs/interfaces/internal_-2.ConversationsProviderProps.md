[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / [<internal\>](../modules/internal_-2.md) / ConversationsProviderProps

# Interface: ConversationsProviderProps

[<internal>](../modules/internal_-2.md).ConversationsProviderProps

The `ConversationsProviderProps` interface defines the shape of the
object that is passed to the `ConversationsProvider` component.

## Table of contents

### Properties

- [children](internal_-2.ConversationsProviderProps.md#children)
- [locationId](internal_-2.ConversationsProviderProps.md#locationid)

## Properties

### children

• **children**: `ReactNode`

The content to render inside the provider. This can
either be a React node or a render callback that receives the loading state,
error information, and conversations data as its arguments.

#### Defined in

[src/conversations/ConversationsProvider.tsx:108](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/ConversationsProvider.tsx#L108)

___

### locationId

• `Optional` **locationId**: `string`

#### Defined in

[src/conversations/ConversationsProvider.tsx:109](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/conversations/ConversationsProvider.tsx#L109)
