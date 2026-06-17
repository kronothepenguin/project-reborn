## castMemberList

**Source**: `docs/drmx2004_scripting_ref.txt` lines 34433-34464

### Usage
```lingo
memberObjRef.castMemberList
memberObjRef.castMemberList;
```

### Description
Cursor cast member property; specifies a list of cast members that make up the frames of a cursor.
For whichCursorCastMember, substitute a cast member name (within quotation marks) or a cast
member number. You can also specify cast members from different casts.
The first cast member in the list is the first frame of the cursor, the second cast member is the
second frame, and so on.
If you specify cast members that are invalid for use in a cursor, they will be ignored, and the
remaining cast members will be used.
This property can be tested and set.

castMemberList

679

### Parameters
None.

### Example
```lingo
This command sets a series of four cast members for the animated color cursor cast member
named myCursor.
-- Lingo syntax
member("myCursor").castmemberList = \
[member(1), member(2), member(1, 2), member(2, 2)]
// JavaScript syntax
member("myCursor").castmemberList =
list(member(1), member(2), member(1, 2), member(2, 2));
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/core/cast-library-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/cast-library-ref.test.js`
- **Dependencies**: None (part of CastLibraryRef class)

