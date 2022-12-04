# How Access tags are used in a Board:

When working with Firestore queries to get the boards a user belongs to, we encountered problems when performing operations to update the members of a board caused by the constant changes of the members of a location, so we needed to create a system that could allow us to get all the data (Board) that we need without having to make a lot of queries to the database.

---

### **_The solution was to create a tags system based on the data that we have for each board_**

---

## Public Boards

Public boards are boards that can be accessed by anyone within the location, which means that we do not have to store the members of the board and instead we can use a generic tag that will allow us to get all the public boards based on the location ID.

> **Public Tag**: `pl_public`

- We only need to store the locationId and the public tag in the board document.
- The **accessTags** attribute is always an array of strings.

```json
{
  "locationId": "locationId",
  "accessTags": ["pl_public"]
}
```

> Note that there are no members in this board; the hosts are stored only in the "hosts" attribute, as we already know that they are members of the board.

---

---

## "By Position" Boards

Boards linked to a position are boards that can be accessed by any employee with the position within the location, which means that we do not have to store the members of the board and instead we need to store the position in the accessTags array.

**IMPORTANT:**
Because these kinds of boards are linked to a position, we do not know the members in the first instance, so we need to include the hosts as special tags next to the position in the accessTags array.

> The special tags are always prefixed with `hostId_` followed by the host id. Example: **_`hostId_1234567890`_**.

- In the next example we have a board that is linked to the position `baker` and the hosts are _Andres with Id `abcd1234567890`_ and _Danilo with Id `efgh0987654321`_.

```json
{
  "locationId": "locationId",
  "accessTags": ["baker", "hostId_abcd1234567890", "hostId_efgh0987654321"]
}
```

> Note that there are no members on this board, but we need to include the hosts as special tags alongside the position in the access tag array, as a host does not necessarily have the position.

---

---

## Private Boards

Private boards are boards that can only be accessed by the members of the board, which means that we need to store the members of the board in the accessTags array.

**IMPORTANT:**
For this kind of board, we need to include the hosts in both the hosts array and the members array, since we query the data based on the accessTags attribute, which is used as the "members" list in private boards.

- In the next example we have a private board with 2 members: _Andres with Id `abcd1234567890`_ and _Danilo with Id `efgh0987654321`_, in addition we have a host: _Cristian with Id `ijkl0987654321`_.

```json
{
  "locationId": "locationId",
  "accessTags": ["abcd1234567890", "efgh0987654321", "ijkl0987654321"],
  "hosts": ["ijkl0987654321"]
}
```

> We have members in private boards, and we use the accessTags attribute to designate "members" including the hosts.
