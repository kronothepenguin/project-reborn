## rect (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 47310-47340

### Usage
```lingo
memberObjRef.rect
memberObjRef.rect;
```

### Description
Member property; specifies the left, top, right, and bottom coordinates, returned as a rectangle,
for the rectangle of any graphic cast member, such as a bitmap, shape, movie, or digital video.
Read-only for all cast members, read/write for field cast members only.
For a bitmap, the rect property is measured from the upper left corner of the bitmap, instead of
from the upper left corner of the easel in the Paint window.
For an Xtra extension cast member, the rect property is a rectangle whose upper left corner is
at (0,0).

### Parameters
None.

### Example
```lingo
This statement displays the coordinates of bitmap cast member 20:
-- Lingo syntax
put(member(20).rect)
// JavaScript syntax
put(member(20).rect);

This statement sets the coordinates of bitmap cast member Banner:
-- Lingo syntax
member("Banner").rect = rect(100, 150, 300, 400)
// JavaScript syntax
member("Banner").rect = rect(100, 150, 300, 400);
```

### See also
Member

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

