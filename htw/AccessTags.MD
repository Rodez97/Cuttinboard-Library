# Access Tags on Cuttinboard

Cuttinboard uses a tags system to manage access to boards on the platform. There are three types of boards: public boards, which can be accessed by anyone within a location; "by position" boards, which can be accessed by employees with a certain position within a location; and private boards, which can only be accessed by specific members.

---

### **_The solution was to create a tags system based on the data that we have for each board_**

---

## Public Boards

Public boards are boards that can be accessed by anyone within a location. To manage access to these boards, Cuttinboard stores the location ID and a `pl_public` tag in the board document's `accessTags` attribute. The `accessTags` attribute is always an array of strings.

Here is an example of a board document for a public board:

```json
{
  "locationId": "locationId",
  "accessTags": ["pl_public"]
}
```

> Note that there are no members in this board; the hosts are stored only in the `hosts` attribute, as we already know that they are members of the board.

---

---

## "By Position" Boards

Boards linked to a position are boards that can be accessed by any employee with the position within the location. To manage access to these boards, Cuttinboard stores the position in the `accessTags` array.

Because these kinds of boards are linked to a position, we do not know the members in the first instance, so we need to include the hosts as special tags next to the position in the `accessTags` array. The special tags are always prefixed with `hostId_` followed by the host id. For example: `hostId_1234567890`.

Here is an example of a board document for a "by position" board:

```json
{
  "locationId": "locationId",
  "accessTags": ["baker", "hostId_abcd1234567890", "hostId_efgh0987654321"]
}
```

> Note that there are no members on this board, but we need to include the hosts as special tags alongside the position in the `accessTags` array, as a host does not necessarily have the position.

---

---

## Private Boards

Private boards are boards that can only be accessed by the members of the board. To manage access to these boards, Cuttinboard stores the members of the board in the `accessTags` array.

For private boards, we need to include the hosts in both the `hosts` array and the `accessTags` array, since we query the data based on the `accessTags` attribute, which is used as the "members" list in private boards.

Here is an example of a board document for a private board:

```json
{
  "locationId": "locationId",
  "accessTags": ["abcd1234567890", "efgh0987654321", "ijkl0987654321"],
  "hosts": ["ijkl0987654321"]
}
```

> We have members in private boards, and we use the `accessTags` attribute to designate "members" including the hosts.

---

### **By using this system, Cuttinboard is able to retrieve all the data needed for a board without having to make multiple queries to the database.**
