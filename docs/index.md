## Classes

<dl>
<dt><a href="#CuttinboardUser">CuttinboardUser</a></dt>
<dd><p>A CuttinboardUser is the base user model for Cuttinboard.</p></dd>
<dt><a href="#LocationKey">LocationKey</a></dt>
<dd><p>The key for a specific location.</p></dd>
<dt><a href="#OrganizationKey">OrganizationKey</a></dt>
<dd></dd>
<dt><a href="#Chat">Chat</a></dt>
<dd></dd>
<dt><a href="#Chat">Chat</a> : <code><a href="#Chat">FirestoreDataConverter.&lt;Chat&gt;</a></code></dt>
<dd></dd>
<dt><a href="#Conversation">Conversation</a></dt>
<dd></dd>
<dt><a href="#Conversation">Conversation</a></dt>
<dd></dd>
<dt><a href="#Message">Message</a></dt>
<dd></dd>
<dt><a href="#Board">Board</a></dt>
<dd><p>A class that represents a board in the database.</p></dd>
<dt><a href="#ChecklistGroup">ChecklistGroup</a></dt>
<dd><p>ChecklistGroup is a class that represents checklists grouped in a Firestore Document.</p></dd>
<dt><a href="#Note">Note</a></dt>
<dd></dd>
<dt><a href="#RecurringTask">RecurringTask</a></dt>
<dd><p>RecurringTask is a class that represents a recurring task.</p></dd>
<dt><a href="#EmployeeShifts">EmployeeShifts</a></dt>
<dd></dd>
</dl>

## Members

<dl>
<dt><a href="#App">App</a></dt>
<dd><p>Instancia de Firestore</p></dd>
<dt><a href="#Firestore">Firestore</a></dt>
<dd><p>Instancia de Auth</p></dd>
<dt><a href="#Auth">Auth</a></dt>
<dd><p>Instancia de Storage</p></dd>
<dt><a href="#Storage">Storage</a></dt>
<dd><p>Instancia de Functions</p></dd>
<dt><a href="#Functions">Functions</a></dt>
<dd><p>Instancia de Realtime Database</p></dd>
<dt><a href="#PrivacyLevel">PrivacyLevel</a></dt>
<dd><p>Nivel de Privacidad de la app:</p>
<ul>
<li>PUBLIC - <em>Abierta para todos los miembros de la locación</em></li>
<li>SELECTED - <em>Solo disponible para los miembros de la locación que posean al menos una de las posiciones indicadas</em></li>
<li>PRIVATE - <em>Solo disponible para los miembros (<strong>members</strong>) seleccionados</em></li>
</ul></dd>
<dt><a href="#RoleAccessLevels">RoleAccessLevels</a> ⇒</dt>
<dd><p>Compare two role access levels and return true if the first role has higher access than the second role.</p></dd>
</dl>

## Constants

<dl>
<dt><a href="#FIREBASE_CONFIG">FIREBASE_CONFIG</a></dt>
<dd><p>Opciones con las que inicializar/configurar la app de Firebase</p></dd>
<dt><a href="#Positions">Positions</a></dt>
<dd><p>Lista de posiciones/etiquetas que pueden ser asignadas a un empleado</p></dd>
</dl>

## Functions

<dl>
<dt><a href="#useRegisterUser">useRegisterUser()</a> ⇒ <code>useRegisterUserType</code></dt>
<dd><p>Register a new user with email and password.</p>
<ul>
<li>If the user is successfully created, the user will be signed in.</li>
</ul></dd>
<dt><a href="#useUpdateCuttinboardAccount">useUpdateCuttinboardAccount()</a> ⇒ <code>useUpdateCuttinboardAccountType</code></dt>
<dd><p>Update the user's profile and contact information.</p></dd>
<dt><a href="#useDeleteCuttinboardAccount">useDeleteCuttinboardAccount()</a> ⇒ <code>useDeleteCuttinboardAccountType</code></dt>
<dd><p>Hook that will help us to delete the current user's account.</p>
<ul>
<li>If the user is successfully deleted, the user will be signed out.</li>
<li>We need to reauthenticate the user before deleting the account to prevent unauthorized deletion.</li>
</ul>
<h4>For a user to be able to delete their account, they must not be OWNER or have any organization pending to be deleted.</h4></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#EmployeeShifts">EmployeeShifts</a> : <code><a href="#EmployeeShifts">EmployeeShifts</a></code></dt>
<dd><p>EmployeeShifts is a collection of shifts for a given employee and week.</p></dd>
</dl>

## Interfaces

<dl>
<dt><a href="#IEmployeeShifts">IEmployeeShifts</a></dt>
<dd></dd>
</dl>

<a name="IEmployeeShifts"></a>

## IEmployeeShifts
**Kind**: global interface  
<a name="CuttinboardUser"></a>

## CuttinboardUser
<p>A CuttinboardUser is the base user model for Cuttinboard.</p>

**Kind**: global class  
**Properties**

| Name | Description |
| --- | --- |
| `id` | <p>The id of the user.</p> |
| `docRef` | <p>The document reference for the user.</p> |
| `avatar` | <p>The avatar of the user.</p> |
| `name` | <p>The name of the user.</p> |
| `lastName` | <p>The last name of the user.</p> |
| `email` | <p>The email of the user.</p> |
| `phoneNumber` | <p>The phone number of the user.</p> |
| `userDocuments` | <p>The documents uploaded by the user. A record of the document id and the storage path.</p> |
| `birthDate` | <p>The birth date of the user. (We don't need to use this, but it's here for future use.)</p> |
| `customerId` | <p>The Stripe customer id of the user in case they have or have had a subscription to cuttinboard.</p> |
| `subscriptionId` | <p>The subscription id of the user in case they have a subscription to the owner plan.</p> |
| `paymentMethods` | <p>The payment methods of the user. This is an array of payment method ids from Stripe.</p> |
| `organizations` | <p>The organizations the user is a part of. This is an array of organization ids.</p> |
| `preferredName` | <p>The preferred name of the user. This is used for contact purposes and is not required.</p> |
| `emergencyContact` | <p>The emergency contact of the user. This is used for contact purposes and is not required.</p> |
| `contactComments` | <p>The contact comments of the user. This is used for contact purposes and is not required.</p> |

<a name="new_CuttinboardUser_new"></a>

### new CuttinboardUser(data, firestoreBase)

| Param | Description |
| --- | --- |
| data | <p>The data to create the CuttinboardUser with.</p> |
| firestoreBase | <p>(id, docRef) - The firestore data for the user.</p> |

<a name="LocationKey"></a>

## LocationKey
<p>The key for a specific location.</p>

**Kind**: global class  
**Properties**

| Name | Description |
| --- | --- |
| `locId` | <p>The id of the location.</p> |
| `role` | <p>The role of the employee in the location.</p> |
| `pos` | <p>The position of the employee in the location.</p> |

<a name="new_LocationKey_new"></a>

### new LocationKey({)
<p>Creates an instance of LocationKey.
Note: The positions are in the form of an array of strings,
but we get them from the organizationKey as a JSON string,
so we need to parse them.</p>


| Param | Type | Description |
| --- | --- | --- |
| { | <code>ILocationKey</code> | <p>locId, role, pos } The location key data.</p> |

<a name="OrganizationKey"></a>

## OrganizationKey
**Kind**: global class  
**Date**: 1/12/2022 - 18:48:07  

* [OrganizationKey](#OrganizationKey)
    * [new OrganizationKey()](#new_OrganizationKey_new)
    * [.locationKey(locationId)](#OrganizationKey+locationKey) ⇒ [<code>LocationKey</code>](#LocationKey) \| <code>undefined</code>

<a name="new_OrganizationKey_new"></a>

### new OrganizationKey()
<p>The Organization Key contains the necessary information about the user's role and permissions within an organization and its locations.</p>

<a name="OrganizationKey+locationKey"></a>

### organizationKey.locationKey(locationId) ⇒ [<code>LocationKey</code>](#LocationKey) \| <code>undefined</code>
<p>Returns the location key for the given locationId.</p>

**Kind**: instance method of [<code>OrganizationKey</code>](#OrganizationKey)  
**Returns**: [<code>LocationKey</code>](#LocationKey) \| <code>undefined</code> - <p>{LocationKey} The location key for the given locationId.</p>  
**Access**: public  
**Date**: 1/12/2022 - 18:48:26  

| Param | Type | Description |
| --- | --- | --- |
| locationId | <code>string</code> | <p>The id of the location to check.</p> |

<a name="Chat"></a>

## Chat
**Kind**: global class  
**Implements**: <code>IChat</code>, <code>PrimaryFirestore</code>  
**Date**: 1/12/2022 - 18:55:36  

* [Chat](#Chat)
    * [new Chat()](#new_Chat_new)
    * [new Chat()](#new_Chat_new)
    * [.getOrderTime](#Chat+getOrderTime) : <code>Date</code>
    * [.isMuted](#Chat+isMuted) : <code>boolean</code>
    * [.recipient](#Chat+recipient) : <code>Recipient</code>
    * [.toggleMuteChat()](#Chat+toggleMuteChat) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="new_Chat_new"></a>

### new Chat()
<p>A Chat is a conversation between two users.</p>
<ul>
<li>A chat, (or Direct Message) is a global chat between two users independent of any location.</li>
<li>To create a chat, you and the other user must be in the same organization.</li>
</ul>

<a name="new_Chat_new"></a>

### new Chat()
<p>This is the converter that is used to convert the data from firestore to the class.</p>

<a name="Chat+getOrderTime"></a>

### chat.getOrderTime : <code>Date</code>
<ul>
<li>If we have a recent message, we can use its timestamp to sort the chats.</li>
<li>If we don't have a recent message, we can use the createdAt timestamp.</li>
</ul>

**Kind**: instance property of [<code>Chat</code>](#Chat)  
**Access**: public  
**Read only**: true  
**Date**: 1/12/2022 - 18:57:28  
<a name="Chat+isMuted"></a>

### chat.isMuted : <code>boolean</code>
<p>Check if the current user has muted this chat.</p>

**Kind**: instance property of [<code>Chat</code>](#Chat)  
**Access**: public  
**Read only**: true  
**Date**: 1/12/2022 - 18:57:50  
<a name="Chat+recipient"></a>

### chat.recipient : <code>Recipient</code>
<p>Get the other user in the chat.</p>
<ul>
<li>This is useful for displaying the other user's name and avatar in the chat list.</li>
<li>This is also useful for displaying the other user's name and avatar in the chat header.</li>
</ul>

**Kind**: instance property of [<code>Chat</code>](#Chat)  
**Access**: public  
**Read only**: true  
**Date**: 1/12/2022 - 18:58:07  
<a name="Chat+toggleMuteChat"></a>

### chat.toggleMuteChat() ⇒ <code>Promise.&lt;void&gt;</code>
<p>Change the muted status of the current user by adding or removing their id from the muted array.</p>

**Kind**: instance method of [<code>Chat</code>](#Chat)  
**Access**: public  
**Date**: 1/12/2022 - 18:58:22  
<a name="Chat"></a>

## Chat : [<code>FirestoreDataConverter.&lt;Chat&gt;</code>](#Chat)
**Kind**: global class  
**Access**: public  
**Date**: 1/12/2022 - 18:57:15  

* [Chat](#Chat) : [<code>FirestoreDataConverter.&lt;Chat&gt;</code>](#Chat)
    * [new Chat()](#new_Chat_new)
    * [new Chat()](#new_Chat_new)
    * [.getOrderTime](#Chat+getOrderTime) : <code>Date</code>
    * [.isMuted](#Chat+isMuted) : <code>boolean</code>
    * [.recipient](#Chat+recipient) : <code>Recipient</code>
    * [.toggleMuteChat()](#Chat+toggleMuteChat) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="new_Chat_new"></a>

### new Chat()
<p>A Chat is a conversation between two users.</p>
<ul>
<li>A chat, (or Direct Message) is a global chat between two users independent of any location.</li>
<li>To create a chat, you and the other user must be in the same organization.</li>
</ul>

<a name="new_Chat_new"></a>

### new Chat()
<p>This is the converter that is used to convert the data from firestore to the class.</p>

<a name="Chat+getOrderTime"></a>

### chat.getOrderTime : <code>Date</code>
<ul>
<li>If we have a recent message, we can use its timestamp to sort the chats.</li>
<li>If we don't have a recent message, we can use the createdAt timestamp.</li>
</ul>

**Kind**: instance property of [<code>Chat</code>](#Chat)  
**Access**: public  
**Read only**: true  
**Date**: 1/12/2022 - 18:57:28  
<a name="Chat+isMuted"></a>

### chat.isMuted : <code>boolean</code>
<p>Check if the current user has muted this chat.</p>

**Kind**: instance property of [<code>Chat</code>](#Chat)  
**Access**: public  
**Read only**: true  
**Date**: 1/12/2022 - 18:57:50  
<a name="Chat+recipient"></a>

### chat.recipient : <code>Recipient</code>
<p>Get the other user in the chat.</p>
<ul>
<li>This is useful for displaying the other user's name and avatar in the chat list.</li>
<li>This is also useful for displaying the other user's name and avatar in the chat header.</li>
</ul>

**Kind**: instance property of [<code>Chat</code>](#Chat)  
**Access**: public  
**Read only**: true  
**Date**: 1/12/2022 - 18:58:07  
<a name="Chat+toggleMuteChat"></a>

### chat.toggleMuteChat() ⇒ <code>Promise.&lt;void&gt;</code>
<p>Change the muted status of the current user by adding or removing their id from the muted array.</p>

**Kind**: instance method of [<code>Chat</code>](#Chat)  
**Access**: public  
**Date**: 1/12/2022 - 18:58:22  
<a name="Conversation"></a>

## Conversation
**Kind**: global class  
**Implements**: <code>IConversation</code>, <code>PrimaryFirestore</code>, <code>FirebaseSignature</code>  
**Date**: 1/12/2022 - 18:28:16  

* [Conversation](#Conversation)
    * [new Conversation()](#new_Conversation_new)
    * [new Conversation(data, {)](#new_Conversation_new)
    * [.getOrderTime](#Conversation+getOrderTime) : <code>Date</code>
    * [.iAmHost](#Conversation+iAmHost) : <code>boolean</code>
    * [.isMuted](#Conversation+isMuted) : <code>boolean</code>
    * [.iAmMember](#Conversation+iAmMember) : <code>boolean</code>
    * [.toggleMuteChat()](#Conversation+toggleMuteChat) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.removeHost(host)](#Conversation+removeHost) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.addMembers(addedEmployees)](#Conversation+addMembers) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.removeMember(memberId)](#Conversation+removeMember) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.update(updates)](#Conversation+update) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="new_Conversation_new"></a>

### new Conversation()
<p>A Conversation is a conversation between two or more users.</p>
<ul>
<li>A conversations always takes place in a location.</li>
</ul>

<a name="new_Conversation_new"></a>

### new Conversation(data, {)
<p>Creates an instance of Conversation.</p>


| Param | Type | Description |
| --- | --- | --- |
| data | <code>IConversation</code> |  |
| { | <code>PrimaryFirestore</code> | <p>id, docRef }</p> |

<a name="Conversation+getOrderTime"></a>

### conversation.getOrderTime : <code>Date</code>
<ul>
<li>If we have a recent message, we can use its timestamp to sort the chats.</li>
<li>If we don't have a recent message, we can use the createdAt timestamp.</li>
</ul>

**Kind**: instance property of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Read only**: true  
**Date**: 1/12/2022 - 18:29:56  
<a name="Conversation+iAmHost"></a>

### conversation.iAmHost : <code>boolean</code>
<p>Check if the current user is a host of this conversation.</p>

**Kind**: instance property of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Read only**: true  
**Date**: 1/12/2022 - 18:30:25  
<a name="Conversation+isMuted"></a>

### conversation.isMuted : <code>boolean</code>
<p>Check if the current user has muted this chat.</p>

**Kind**: instance property of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Read only**: true  
**Date**: 1/12/2022 - 18:31:02  
<a name="Conversation+iAmMember"></a>

### conversation.iAmMember : <code>boolean</code>
<p>Check if the current user is a direct member of this conversation.</p>

**Kind**: instance property of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Read only**: true  
**Date**: 1/12/2022 - 18:31:15  
<a name="Conversation+toggleMuteChat"></a>

### conversation.toggleMuteChat() ⇒ <code>Promise.&lt;void&gt;</code>
<p>Change the muted status of the current user by adding or removing their id from the muted array.</p>

**Kind**: instance method of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Date**: 1/12/2022 - 18:31:29  
<a name="Conversation+removeHost"></a>

### conversation.removeHost(host) ⇒ <code>Promise.&lt;void&gt;</code>
<p>Removes a host from the conversation.</p>
<ul>
<li>If the host meets the membership requirements, they will remain a member.</li>
</ul>

**Kind**: instance method of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Date**: 1/12/2022 - 18:33:49  

| Param | Type | Description |
| --- | --- | --- |
| host | <code>Employee</code> | <p>The host to remove.</p> |

<a name="Conversation+addMembers"></a>

### conversation.addMembers(addedEmployees) ⇒ <code>Promise.&lt;void&gt;</code>
<p>Adds a member to the conversation.</p>
<ul>
<li>We can only add members if the conversation is private.</li>
</ul>

**Kind**: instance method of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Date**: 1/12/2022 - 18:34:34  

| Param | Type | Description |
| --- | --- | --- |
| addedEmployees | <code>Array.&lt;Employee&gt;</code> | <p>The employees to add to the conversation.</p> |

<a name="Conversation+removeMember"></a>

### conversation.removeMember(memberId) ⇒ <code>Promise.&lt;void&gt;</code>
<p>Removes a member from the conversation.</p>
<ul>
<li>We can only remove members if the conversation is private.</li>
</ul>

**Kind**: instance method of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Date**: 1/12/2022 - 18:35:03  

| Param | Type | Description |
| --- | --- | --- |
| memberId | <code>string</code> | <p>The id of the member to remove.</p> |

<a name="Conversation+update"></a>

### conversation.update(updates) ⇒ <code>Promise.&lt;void&gt;</code>
<p><strong>The fields that can be updated are:</strong></p>
<ul>
<li>name</li>
<li>description</li>
<li>position</li>
</ul>

**Kind**: instance method of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Date**: 1/12/2022 - 18:35:27  

| Param | Type | Description |
| --- | --- | --- |
| updates | <code>PartialWithFieldValue.&lt;Pick.&lt;IConversation, (&quot;name&quot;\|&quot;description&quot;\|&quot;position&quot;)&gt;&gt;</code> | <p>The updates to make to the conversation.</p> |

<a name="Conversation"></a>

## Conversation
**Kind**: global class  
**Date**: 1/12/2022 - 18:29:37  

* [Conversation](#Conversation)
    * [new Conversation()](#new_Conversation_new)
    * [new Conversation(data, {)](#new_Conversation_new)
    * [.getOrderTime](#Conversation+getOrderTime) : <code>Date</code>
    * [.iAmHost](#Conversation+iAmHost) : <code>boolean</code>
    * [.isMuted](#Conversation+isMuted) : <code>boolean</code>
    * [.iAmMember](#Conversation+iAmMember) : <code>boolean</code>
    * [.toggleMuteChat()](#Conversation+toggleMuteChat) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.removeHost(host)](#Conversation+removeHost) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.addMembers(addedEmployees)](#Conversation+addMembers) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.removeMember(memberId)](#Conversation+removeMember) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.update(updates)](#Conversation+update) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="new_Conversation_new"></a>

### new Conversation()
<p>A Conversation is a conversation between two or more users.</p>
<ul>
<li>A conversations always takes place in a location.</li>
</ul>

<a name="new_Conversation_new"></a>

### new Conversation(data, {)
<p>Creates an instance of Conversation.</p>


| Param | Type | Description |
| --- | --- | --- |
| data | <code>IConversation</code> |  |
| { | <code>PrimaryFirestore</code> | <p>id, docRef }</p> |

<a name="Conversation+getOrderTime"></a>

### conversation.getOrderTime : <code>Date</code>
<ul>
<li>If we have a recent message, we can use its timestamp to sort the chats.</li>
<li>If we don't have a recent message, we can use the createdAt timestamp.</li>
</ul>

**Kind**: instance property of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Read only**: true  
**Date**: 1/12/2022 - 18:29:56  
<a name="Conversation+iAmHost"></a>

### conversation.iAmHost : <code>boolean</code>
<p>Check if the current user is a host of this conversation.</p>

**Kind**: instance property of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Read only**: true  
**Date**: 1/12/2022 - 18:30:25  
<a name="Conversation+isMuted"></a>

### conversation.isMuted : <code>boolean</code>
<p>Check if the current user has muted this chat.</p>

**Kind**: instance property of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Read only**: true  
**Date**: 1/12/2022 - 18:31:02  
<a name="Conversation+iAmMember"></a>

### conversation.iAmMember : <code>boolean</code>
<p>Check if the current user is a direct member of this conversation.</p>

**Kind**: instance property of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Read only**: true  
**Date**: 1/12/2022 - 18:31:15  
<a name="Conversation+toggleMuteChat"></a>

### conversation.toggleMuteChat() ⇒ <code>Promise.&lt;void&gt;</code>
<p>Change the muted status of the current user by adding or removing their id from the muted array.</p>

**Kind**: instance method of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Date**: 1/12/2022 - 18:31:29  
<a name="Conversation+removeHost"></a>

### conversation.removeHost(host) ⇒ <code>Promise.&lt;void&gt;</code>
<p>Removes a host from the conversation.</p>
<ul>
<li>If the host meets the membership requirements, they will remain a member.</li>
</ul>

**Kind**: instance method of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Date**: 1/12/2022 - 18:33:49  

| Param | Type | Description |
| --- | --- | --- |
| host | <code>Employee</code> | <p>The host to remove.</p> |

<a name="Conversation+addMembers"></a>

### conversation.addMembers(addedEmployees) ⇒ <code>Promise.&lt;void&gt;</code>
<p>Adds a member to the conversation.</p>
<ul>
<li>We can only add members if the conversation is private.</li>
</ul>

**Kind**: instance method of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Date**: 1/12/2022 - 18:34:34  

| Param | Type | Description |
| --- | --- | --- |
| addedEmployees | <code>Array.&lt;Employee&gt;</code> | <p>The employees to add to the conversation.</p> |

<a name="Conversation+removeMember"></a>

### conversation.removeMember(memberId) ⇒ <code>Promise.&lt;void&gt;</code>
<p>Removes a member from the conversation.</p>
<ul>
<li>We can only remove members if the conversation is private.</li>
</ul>

**Kind**: instance method of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Date**: 1/12/2022 - 18:35:03  

| Param | Type | Description |
| --- | --- | --- |
| memberId | <code>string</code> | <p>The id of the member to remove.</p> |

<a name="Conversation+update"></a>

### conversation.update(updates) ⇒ <code>Promise.&lt;void&gt;</code>
<p><strong>The fields that can be updated are:</strong></p>
<ul>
<li>name</li>
<li>description</li>
<li>position</li>
</ul>

**Kind**: instance method of [<code>Conversation</code>](#Conversation)  
**Access**: public  
**Date**: 1/12/2022 - 18:35:27  

| Param | Type | Description |
| --- | --- | --- |
| updates | <code>PartialWithFieldValue.&lt;Pick.&lt;IConversation, (&quot;name&quot;\|&quot;description&quot;\|&quot;position&quot;)&gt;&gt;</code> | <p>The updates to make to the conversation.</p> |

<a name="Message"></a>

## Message
**Kind**: global class  
**Implements**: <code>IMessage</code>  
**Date**: 17/10/2022 - 1:00:14  
<a name="new_Message_new"></a>

### new Message()
<p>Chat Message</p>

<a name="Board"></a>

## Board
<p>A class that represents a board in the database.</p>

**Kind**: global class  

* [Board](#Board)
    * [.contentRef](#Board+contentRef)
    * [.amIhost](#Board+amIhost)
    * [.position](#Board+position)
    * [.getMembers](#Board+getMembers)
    * [.update(updates)](#Board+update)
    * [.delete()](#Board+delete)
    * [.addHost(newHost)](#Board+addHost)
    * [.removeHost(hostId)](#Board+removeHost)
    * [.addMembers(addedEmployees)](#Board+addMembers)
    * [.removeMember(memberId)](#Board+removeMember)

<a name="Board+contentRef"></a>

### board.contentRef
<p>Reference of the content collection of this module.</p>

**Kind**: instance property of [<code>Board</code>](#Board)  
<a name="Board+amIhost"></a>

### board.amIhost
<p>Returns true if the current user is a host of this module.</p>

**Kind**: instance property of [<code>Board</code>](#Board)  
<a name="Board+position"></a>

### board.position
<p>Returns the position of this module only if the privacy level is set to positions.</p>

**Kind**: instance property of [<code>Board</code>](#Board)  
<a name="Board+getMembers"></a>

### board.getMembers
<p>Get the members of this module.</p>

**Kind**: instance property of [<code>Board</code>](#Board)  
<a name="Board+update"></a>

### board.update(updates)
<p>Updates the module with the given data.</p>

**Kind**: instance method of [<code>Board</code>](#Board)  

| Param | Description |
| --- | --- |
| updates | <p>The data to update.</p> |

<a name="Board+delete"></a>

### board.delete()
<p>Deletes the module.</p>

**Kind**: instance method of [<code>Board</code>](#Board)  
<a name="Board+addHost"></a>

### board.addHost(newHost)
<p>Add a host to the module.</p>

**Kind**: instance method of [<code>Board</code>](#Board)  

| Param | Description |
| --- | --- |
| newHost | <p>The new host to add.</p> |

<a name="Board+removeHost"></a>

### board.removeHost(hostId)
<p>Remove a host from the module.</p>

**Kind**: instance method of [<code>Board</code>](#Board)  

| Param | Description |
| --- | --- |
| hostId | <p>The host to remove.</p> |

<a name="Board+addMembers"></a>

### board.addMembers(addedEmployees)
<p>Add new members to the module.</p>

**Kind**: instance method of [<code>Board</code>](#Board)  

| Param | Description |
| --- | --- |
| addedEmployees | <p>The employees to add.</p> |

<a name="Board+removeMember"></a>

### board.removeMember(memberId)
<p>Remove a member from the module.</p>

**Kind**: instance method of [<code>Board</code>](#Board)  

| Param | Description |
| --- | --- |
| memberId | <p>The member to remove.</p> |

<a name="ChecklistGroup"></a>

## ChecklistGroup
<p>ChecklistGroup is a class that represents checklists grouped in a Firestore Document.</p>

**Kind**: global class  

* [ChecklistGroup](#ChecklistGroup)
    * [.summary](#ChecklistGroup+summary)
    * [.getChecklistSummary(sectionKey)](#ChecklistGroup+getChecklistSummary)
    * [.changeTaskStatus(checklistKey, taskKey, status)](#ChecklistGroup+changeTaskStatus)
    * [.addTask(checklistKey, taskKey, task)](#ChecklistGroup+addTask)
    * [.removeTask(sectionKey, taskKey)](#ChecklistGroup+removeTask)
    * [.resetAllTasks()](#ChecklistGroup+resetAllTasks)
    * [.removeChecklist(checklistKey)](#ChecklistGroup+removeChecklist)
    * [.addChecklist(sectionKey, newTask)](#ChecklistGroup+addChecklist)
    * [.updateTask(checklistKey, taskKey, task)](#ChecklistGroup+updateTask)
    * [.updateChecklist(checklistKey, checklist)](#ChecklistGroup+updateChecklist)
    * [.deleteAllTasks()](#ChecklistGroup+deleteAllTasks)

<a name="ChecklistGroup+summary"></a>

### checklistGroup.summary
<p>Get a summary of the completion status of all the tasks in the checklists of this group.</p>

**Kind**: instance property of [<code>ChecklistGroup</code>](#ChecklistGroup)  
<a name="ChecklistGroup+getChecklistSummary"></a>

### checklistGroup.getChecklistSummary(sectionKey)
<p>Get a summary of the completion status of a specific checklist in this group.</p>

**Kind**: instance method of [<code>ChecklistGroup</code>](#ChecklistGroup)  

| Param | Description |
| --- | --- |
| sectionKey | <p>The key of the checklist to get the summary of.</p> |

<a name="ChecklistGroup+changeTaskStatus"></a>

### checklistGroup.changeTaskStatus(checklistKey, taskKey, status)
<p>Update the status of a task.</p>

**Kind**: instance method of [<code>ChecklistGroup</code>](#ChecklistGroup)  

| Param | Description |
| --- | --- |
| checklistKey | <p>The key of the checklist that contains the task.</p> |
| taskKey | <p>The key of the task to update.</p> |
| status | <p>The new status of the task.</p> |

<a name="ChecklistGroup+addTask"></a>

### checklistGroup.addTask(checklistKey, taskKey, task)
<p>Add a new task to a checklist.</p>

**Kind**: instance method of [<code>ChecklistGroup</code>](#ChecklistGroup)  

| Param | Description |
| --- | --- |
| checklistKey | <p>The key of the checklist to add the task to.</p> |
| taskKey | <p>The key of the task to add.</p> |
| task | <p>The task to add.</p> |

<a name="ChecklistGroup+removeTask"></a>

### checklistGroup.removeTask(sectionKey, taskKey)
<p>Delete a task from a checklist.</p>

**Kind**: instance method of [<code>ChecklistGroup</code>](#ChecklistGroup)  

| Param | Description |
| --- | --- |
| sectionKey | <p>The key of the checklist to delete the task from.</p> |
| taskKey | <p>The key of the task to delete.</p> |

<a name="ChecklistGroup+resetAllTasks"></a>

### checklistGroup.resetAllTasks()
<p>Reset the status of all the tasks in all the checklists of this group.</p>

**Kind**: instance method of [<code>ChecklistGroup</code>](#ChecklistGroup)  
<a name="ChecklistGroup+removeChecklist"></a>

### checklistGroup.removeChecklist(checklistKey)
<p>Remove a checklist from this group.</p>

**Kind**: instance method of [<code>ChecklistGroup</code>](#ChecklistGroup)  

| Param | Description |
| --- | --- |
| checklistKey | <p>The key of the checklist to remove.</p> |

<a name="ChecklistGroup+addChecklist"></a>

### checklistGroup.addChecklist(sectionKey, newTask)
<p>Add a new checklist to this group.</p>

**Kind**: instance method of [<code>ChecklistGroup</code>](#ChecklistGroup)  

| Param | Description |
| --- | --- |
| sectionKey | <p>The key of the checklist to add.</p> |
| newTask | <p>If provided, a new task will be added to the checklist in the same operation.</p> |

<a name="ChecklistGroup+updateTask"></a>

### checklistGroup.updateTask(checklistKey, taskKey, task)
<p>Update a specific task in a checklist.</p>

**Kind**: instance method of [<code>ChecklistGroup</code>](#ChecklistGroup)  

| Param | Description |
| --- | --- |
| checklistKey | <p>The key of the checklist to update.</p> |
| taskKey | <p>The key of the task to update.</p> |
| task | <p>The new task data.</p> |

<a name="ChecklistGroup+updateChecklist"></a>

### checklistGroup.updateChecklist(checklistKey, checklist)
<p>Update a specific checklist.</p>

**Kind**: instance method of [<code>ChecklistGroup</code>](#ChecklistGroup)  

| Param | Description |
| --- | --- |
| checklistKey | <p>The key of the checklist to update.</p> |
| checklist | <p>The new checklist data.</p> |

<a name="ChecklistGroup+deleteAllTasks"></a>

### checklistGroup.deleteAllTasks()
<p>Delete of checklist and all its tasks from this group.</p>

**Kind**: instance method of [<code>ChecklistGroup</code>](#ChecklistGroup)  
<a name="Note"></a>

## Note
**Kind**: global class  

* [Note](#Note)
    * [new Note(contentRef, data)](#new_Note_new)
    * [.delete()](#Note+delete)

<a name="new_Note_new"></a>

### new Note(contentRef, data)
<p>Create a new note in the database and return it as a Note object instance with the id and docRef properties</p>

**Returns**: <p>The new note as a Note object instance</p>  

| Param | Description |
| --- | --- |
| contentRef | <p>The reference to the content collection</p> |
| data | <p>The data to create the note with</p> |

<a name="Note+delete"></a>

### note.delete()
<p>Delete the note from the database</p>

**Kind**: instance method of [<code>Note</code>](#Note)  
<a name="RecurringTask"></a>

## RecurringTask
<p>RecurringTask is a class that represents a recurring task.</p>

**Kind**: global class  

* [RecurringTask](#RecurringTask)
    * _instance_
        * [.recurrenceRule](#RecurringTask+recurrenceRule) : <code>RRule</code>
        * [.isToday](#RecurringTask+isToday) : <code>boolean</code>
        * [.nextOccurrence](#RecurringTask+nextOccurrence) : <code>Date</code>
        * [.matchesDate(date)](#RecurringTask+matchesDate) ⇒
    * _static_
        * [.getRRuleFromObject(param)](#RecurringTask.getRRuleFromObject) ⇒
        * [.getRRuleObjectFromRule(rule)](#RecurringTask.getRRuleObjectFromRule) ⇒

<a name="RecurringTask+recurrenceRule"></a>

### recurringTask.recurrenceRule : <code>RRule</code>
<p>Returns the Recurrence Rule from this Recurring Task</p>

**Kind**: instance property of [<code>RecurringTask</code>](#RecurringTask)  
<a name="RecurringTask+isToday"></a>

### recurringTask.isToday : <code>boolean</code>
<p>Checks if the task is due today</p>

**Kind**: instance property of [<code>RecurringTask</code>](#RecurringTask)  
<a name="RecurringTask+nextOccurrence"></a>

### recurringTask.nextOccurrence : <code>Date</code>
<p>Get the next occurrence of the task</p>

**Kind**: instance property of [<code>RecurringTask</code>](#RecurringTask)  
<a name="RecurringTask+matchesDate"></a>

### recurringTask.matchesDate(date) ⇒
<p>Checks if a date matches the recurrence rule</p>

**Kind**: instance method of [<code>RecurringTask</code>](#RecurringTask)  
**Returns**: <p>True if the date matches the recurrence rule</p>  

| Param | Description |
| --- | --- |
| date | <p>Date to check</p> |

<a name="RecurringTask.getRRuleFromObject"></a>

### RecurringTask.getRRuleFromObject(param) ⇒
<p>Returns the Recurrence Rule from the Recurrence Object</p>

**Kind**: static method of [<code>RecurringTask</code>](#RecurringTask)  
**Returns**: <p>Recurrence Rule</p>  

| Param | Description |
| --- | --- |
| param | <p>Recurrence Object</p> |

<a name="RecurringTask.getRRuleObjectFromRule"></a>

### RecurringTask.getRRuleObjectFromRule(rule) ⇒
<p>Returns a Recurrence Object from the Recurrence Rule</p>

**Kind**: static method of [<code>RecurringTask</code>](#RecurringTask)  
**Returns**: <p>Recurrence Object</p>  

| Param | Description |
| --- | --- |
| rule | <p>Recurrence Rule</p> |

<a name="EmployeeShifts"></a>

## EmployeeShifts
**Kind**: global class  

* [EmployeeShifts](#EmployeeShifts)
    * [new EmployeeShifts()](#new_EmployeeShifts_new)
    * [.shiftsArray](#EmployeeShifts+shiftsArray)
    * [.haveChanges](#EmployeeShifts+haveChanges)
    * [.calculateWageData()](#EmployeeShifts+calculateWageData)
    * [.createShift(shift, dates, applyToWeekDays, id)](#EmployeeShifts+createShift) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.batchPublish(batch)](#EmployeeShifts+batchPublish)
    * [.batchUnpublish(batch)](#EmployeeShifts+batchUnpublish)

<a name="new_EmployeeShifts_new"></a>

### new EmployeeShifts()
<p>Firestore Data Converter</p>

<a name="EmployeeShifts+shiftsArray"></a>

### employeeShifts.shiftsArray
<p>Get the shifts array from the shifts object and sort it by start time in ascending order (earliest to latest)</p>

**Kind**: instance property of [<code>EmployeeShifts</code>](#EmployeeShifts)  
<a name="EmployeeShifts+haveChanges"></a>

### employeeShifts.haveChanges
<p>Check is the employee's schedule have any changes or is unpublished</p>

**Kind**: instance property of [<code>EmployeeShifts</code>](#EmployeeShifts)  
<a name="EmployeeShifts+calculateWageData"></a>

### employeeShifts.calculateWageData()
<p>Initialize/Calculate the wage data for the employee's schedule for the week
based on the <em>overtime</em> settings for the location and the employee's wage</p>
<ul>
<li>
<p>If there is no overtime settings for the location, the wage data will be
calculated based on the employee's wage only</p>
</li>
<li>
<p>If this functions in not called, the wage data will be the default value without overtime</p>
</li>
</ul>

**Kind**: instance method of [<code>EmployeeShifts</code>](#EmployeeShifts)  
<a name="EmployeeShifts+createShift"></a>

### employeeShifts.createShift(shift, dates, applyToWeekDays, id) ⇒ <code>Promise.&lt;void&gt;</code>
<p>Creates a new shift and adds it to the schedule</p>

**Kind**: instance method of [<code>EmployeeShifts</code>](#EmployeeShifts)  
**Returns**: <code>Promise.&lt;void&gt;</code> - <ul>
<li>A promise that resolves when the shift is added</li>
</ul>  
**Access**: public  
**Date**: 6/11/2022 - 23:11:52  

| Param | Type | Description |
| --- | --- | --- |
| shift | <code>IShift</code> | <p>The shift to add</p> |
| dates | <code>Array.&lt;Date&gt;</code> | <p>The dates to add the shift to</p> |
| applyToWeekDays | <code>Array.&lt;number&gt;</code> | <p>The weekdays to apply the shift to</p> |
| id | <code>string</code> | <p>The id of the shift</p> |

<a name="EmployeeShifts+batchPublish"></a>

### employeeShifts.batchPublish(batch)
<p>Publishes all shifts in the schedule</p>

**Kind**: instance method of [<code>EmployeeShifts</code>](#EmployeeShifts)  
**Access**: public  
**Date**: 6/11/2022 - 23:09:43  

| Param | Type | Description |
| --- | --- | --- |
| batch | <code>WriteBatch</code> | <p>Firestore batch</p> |

<a name="EmployeeShifts+batchUnpublish"></a>

### employeeShifts.batchUnpublish(batch)
<p>Unpublish all shifts in the schedule</p>

**Kind**: instance method of [<code>EmployeeShifts</code>](#EmployeeShifts)  
**Access**: public  
**Date**: 6/11/2022 - 23:07:32  

| Param | Type | Description |
| --- | --- | --- |
| batch | <code>WriteBatch</code> | <p>Firestore batch</p> |

<a name="App"></a>

## App
<p>Instancia de Firestore</p>

**Kind**: global variable  
<a name="Firestore"></a>

## Firestore
<p>Instancia de Auth</p>

**Kind**: global variable  
<a name="Auth"></a>

## Auth
<p>Instancia de Storage</p>

**Kind**: global variable  
<a name="Storage"></a>

## Storage
<p>Instancia de Functions</p>

**Kind**: global variable  
<a name="Functions"></a>

## Functions
<p>Instancia de Realtime Database</p>

**Kind**: global variable  
<a name="PrivacyLevel"></a>

## PrivacyLevel
<p>Nivel de Privacidad de la app:</p>
<ul>
<li>PUBLIC - <em>Abierta para todos los miembros de la locación</em></li>
<li>SELECTED - <em>Solo disponible para los miembros de la locación que posean al menos una de las posiciones indicadas</em></li>
<li>PRIVATE - <em>Solo disponible para los miembros (<strong>members</strong>) seleccionados</em></li>
</ul>

**Kind**: global variable  
<a name="RoleAccessLevels"></a>

## RoleAccessLevels ⇒
<p>Compare two role access levels and return true if the first role has higher access than the second role.</p>

**Kind**: global variable  
**Returns**: <p>True if the user has higher access than the employee.</p>  

| Param | Description |
| --- | --- |
| userRole | <p>The role of the user.</p> |
| employeeRole | <p>The role of the employee.</p> |

<a name="FIREBASE_CONFIG"></a>

## FIREBASE\_CONFIG
<p>Opciones con las que inicializar/configurar la app de Firebase</p>

**Kind**: global constant  
<a name="Positions"></a>

## Positions
<p>Lista de posiciones/etiquetas que pueden ser asignadas a un empleado</p>

**Kind**: global constant  
<a name="useRegisterUser"></a>

## useRegisterUser() ⇒ <code>useRegisterUserType</code>
<p>Register a new user with email and password.</p>
<ul>
<li>If the user is successfully created, the user will be signed in.</li>
</ul>

**Kind**: global function  
**Returns**: <code>useRegisterUserType</code> - <ul>
<li>The register user hook.</li>
</ul>  
<a name="useUpdateCuttinboardAccount"></a>

## useUpdateCuttinboardAccount() ⇒ <code>useUpdateCuttinboardAccountType</code>
<p>Update the user's profile and contact information.</p>

**Kind**: global function  
**Returns**: <code>useUpdateCuttinboardAccountType</code> - <p>The update operation status and error.</p>  
<a name="useDeleteCuttinboardAccount"></a>

## useDeleteCuttinboardAccount() ⇒ <code>useDeleteCuttinboardAccountType</code>
<p>Hook that will help us to delete the current user's account.</p>
<ul>
<li>If the user is successfully deleted, the user will be signed out.</li>
<li>We need to reauthenticate the user before deleting the account to prevent unauthorized deletion.</li>
</ul>
<h4>For a user to be able to delete their account, they must not be OWNER or have any organization pending to be deleted.</h4>

**Kind**: global function  
**Returns**: <code>useDeleteCuttinboardAccountType</code> - <p>The delete operation status and error.</p>  
<a name="EmployeeShifts"></a>

## EmployeeShifts : [<code>EmployeeShifts</code>](#EmployeeShifts)
<p>EmployeeShifts is a collection of shifts for a given employee and week.</p>

**Kind**: global typedef  
**Implements**: [<code>IEmployeeShifts</code>](#IEmployeeShifts), <code>PrimaryFirestore</code>, <code>FirebaseSignature</code>  
**Date**: 6/11/2022 - 23:38:09  

* [EmployeeShifts](#EmployeeShifts) : [<code>EmployeeShifts</code>](#EmployeeShifts)
    * [new EmployeeShifts()](#new_EmployeeShifts_new)
    * [.shiftsArray](#EmployeeShifts+shiftsArray)
    * [.haveChanges](#EmployeeShifts+haveChanges)
    * [.calculateWageData()](#EmployeeShifts+calculateWageData)
    * [.createShift(shift, dates, applyToWeekDays, id)](#EmployeeShifts+createShift) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.batchPublish(batch)](#EmployeeShifts+batchPublish)
    * [.batchUnpublish(batch)](#EmployeeShifts+batchUnpublish)

<a name="new_EmployeeShifts_new"></a>

### new EmployeeShifts()
<p>Firestore Data Converter</p>

<a name="EmployeeShifts+shiftsArray"></a>

### employeeShifts.shiftsArray
<p>Get the shifts array from the shifts object and sort it by start time in ascending order (earliest to latest)</p>

**Kind**: instance property of [<code>EmployeeShifts</code>](#EmployeeShifts)  
<a name="EmployeeShifts+haveChanges"></a>

### employeeShifts.haveChanges
<p>Check is the employee's schedule have any changes or is unpublished</p>

**Kind**: instance property of [<code>EmployeeShifts</code>](#EmployeeShifts)  
<a name="EmployeeShifts+calculateWageData"></a>

### employeeShifts.calculateWageData()
<p>Initialize/Calculate the wage data for the employee's schedule for the week
based on the <em>overtime</em> settings for the location and the employee's wage</p>
<ul>
<li>
<p>If there is no overtime settings for the location, the wage data will be
calculated based on the employee's wage only</p>
</li>
<li>
<p>If this functions in not called, the wage data will be the default value without overtime</p>
</li>
</ul>

**Kind**: instance method of [<code>EmployeeShifts</code>](#EmployeeShifts)  
<a name="EmployeeShifts+createShift"></a>

### employeeShifts.createShift(shift, dates, applyToWeekDays, id) ⇒ <code>Promise.&lt;void&gt;</code>
<p>Creates a new shift and adds it to the schedule</p>

**Kind**: instance method of [<code>EmployeeShifts</code>](#EmployeeShifts)  
**Returns**: <code>Promise.&lt;void&gt;</code> - <ul>
<li>A promise that resolves when the shift is added</li>
</ul>  
**Access**: public  
**Date**: 6/11/2022 - 23:11:52  

| Param | Type | Description |
| --- | --- | --- |
| shift | <code>IShift</code> | <p>The shift to add</p> |
| dates | <code>Array.&lt;Date&gt;</code> | <p>The dates to add the shift to</p> |
| applyToWeekDays | <code>Array.&lt;number&gt;</code> | <p>The weekdays to apply the shift to</p> |
| id | <code>string</code> | <p>The id of the shift</p> |

<a name="EmployeeShifts+batchPublish"></a>

### employeeShifts.batchPublish(batch)
<p>Publishes all shifts in the schedule</p>

**Kind**: instance method of [<code>EmployeeShifts</code>](#EmployeeShifts)  
**Access**: public  
**Date**: 6/11/2022 - 23:09:43  

| Param | Type | Description |
| --- | --- | --- |
| batch | <code>WriteBatch</code> | <p>Firestore batch</p> |

<a name="EmployeeShifts+batchUnpublish"></a>

### employeeShifts.batchUnpublish(batch)
<p>Unpublish all shifts in the schedule</p>

**Kind**: instance method of [<code>EmployeeShifts</code>](#EmployeeShifts)  
**Access**: public  
**Date**: 6/11/2022 - 23:07:32  

| Param | Type | Description |
| --- | --- | --- |
| batch | <code>WriteBatch</code> | <p>Firestore batch</p> |

