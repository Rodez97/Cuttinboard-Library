@cuttinboard-solutions/cuttinboard-library / [Exports](modules.md)

[Access Tags](AccessTags.MD)

```mermaid
sequenceDiagram
  participant User
  participant Function
  participant Firestore
  User->>Function: Call cloneShifts()
  Function->>Firestore: Retrieve year and week number from targetWeekId
  Firestore->>Function: Return year and week number
  Function->>Function: Calculate first day of target week using weekToDate
  Function->>Function: Calculate number of weeks difference between target and current week
  Function->>Firestore: Chunk employees into groups of 10 and retrieve their shifts for target week
  Firestore->>Function: Return shifts for target week
  Function->>Function: For each retrieved target week shift:
    * Check if shift exists in current week and is not being deleted or has pending updates
    * Adjust shift start and end dates using weeks difference
    * Create new shift for current week using adjusted dates
  Function->>Firestore: Update shifts for current week in database using batch write
  Firestore->>Function: Return updated shifts for current week
  Function->>User: Return updated shifts for current week

```
