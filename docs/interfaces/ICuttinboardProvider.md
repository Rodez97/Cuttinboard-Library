[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / ICuttinboardProvider

# Interface: ICuttinboardProvider

The `ICuttinboardProviderProps` interface represents the props for the `CuttinboardProvider` component.
It includes the children of the component, as well as components for rendering errors, loading, and no user.

## Table of contents

### Properties

- [ErrorRenderer](ICuttinboardProvider.md#errorrenderer)
- [LoadingRenderer](ICuttinboardProvider.md#loadingrenderer)
- [NoUserRenderer](ICuttinboardProvider.md#nouserrenderer)
- [children](ICuttinboardProvider.md#children)

## Properties

### ErrorRenderer

• **ErrorRenderer**: (`error`: `Error`) => `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\>

#### Type declaration

▸ (`error`): `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\>

A component for rendering errors.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | `Error` | The error to render. |

##### Returns

`ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\>

A React element to render the error.

#### Defined in

services/CuttinboardProvider.tsx:67

___

### LoadingRenderer

• **LoadingRenderer**: (`loading`: `boolean`) => `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\>

#### Type declaration

▸ (`loading`): `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\>

A component for rendering the loading state.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `loading` | `boolean` | A flag indicating whether the component is in the loading state. |

##### Returns

`ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\>

A React element to render the loading state.

#### Defined in

services/CuttinboardProvider.tsx:73

___

### NoUserRenderer

• **NoUserRenderer**: `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\>

A component for rendering when there is no user.

#### Defined in

services/CuttinboardProvider.tsx:77

___

### children

• **children**: `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\> \| (`props`: { `organizationKey`: `undefined` \| ``null`` \| [`OrganizationKey`](../classes/OrganizationKey.md) ; `user`: `User`  }) => `ReactElement`<`any`, `string` \| `JSXElementConstructor`<`any`\>\>

The children of the component.
This can be a React element or a function that returns a React element.

#### Defined in

services/CuttinboardProvider.tsx:56
