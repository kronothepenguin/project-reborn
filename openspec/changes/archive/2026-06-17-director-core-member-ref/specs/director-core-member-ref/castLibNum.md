## castLibNum

**Source**: `docs/drmx2004_scripting_ref.txt` lines 34406-34432

### Usage
```lingo
memberObjRef.castLibNum
memberObjRef.castLibNum;
```

### Description
Member property; determines the number of the cast library that a cast member belongs to.
Read-only.

### Parameters
None.

### Example
```lingo
This statement determines the number of the cast to which cast member Jazz is assigned.
-- Lingo syntax
put(member("Jazz").castLibNum)
// JavaScript syntax
put(member("Jazz").castLibNum);

The following statement changes the cast member assigned to sprite 5 by switching its cast to
Wednesday Schedule.
-- Lingo syntax
sprite(5).castLibNum = castLib("Wednesday Schedule").number
// JavaScript syntax
sprite(5).castLibNum = castLib("Wednesday Schedule").number;
```

### See also
Cast Library, Member

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

