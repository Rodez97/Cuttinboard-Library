[@cuttinboard-solutions/cuttinboard-library](../README.md) / [Exports](../modules.md) / <internal\>

# Module: <internal\>

## Table of contents

### Type Aliases

- [Action](internal_-5.md#action)

## Type Aliases

### Action

Ƭ **Action**: { `payload`: { `_id`: `string`  } ; `type`: ``"DELETE_MESSAGE"``  } \| { `payload`: `IMessage` ; `type`: ``"SET_MESSAGE"``  } \| { `payload`: `Partial`<`IMessage`\> & { `_id`: `number`  } ; `type`: ``"UPDATE_MESSAGE"``  } \| { `payload`: `IMessage`[] ; `type`: ``"ADD_MESSAGES"``  } \| { `payload`: `IMessage`[] ; `type`: ``"APPEND_OLDER_MESSAGES"``  } \| { `type`: ``"CLEAR_MESSAGES"``  } \| { `payload`: `IMessage` ; `type`: ``"ADD_MESSAGE"``  } \| { `payload`: `IMessage`[] ; `type`: ``"SET_MESSAGES"``  }

#### Defined in

[src/messages/messageReducer.ts:3](https://github.com/Cuttinboard-Solutions/Cuttinboard-Library/blob/97c340c/src/messages/messageReducer.ts#L3)
