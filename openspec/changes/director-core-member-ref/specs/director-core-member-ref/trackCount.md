## trackCount (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 52254-52273

### Usage
```lingo
memberObjRef.trackCount()
memberObjRef.trackCount();
```

### Description
Digital video cast member property; returns the number of tracks in the specified digital video
cast member.
This property can be tested but not set.

### Parameters
None.

### Example
```lingo
This statement determines the number of tracks in the digital video cast member Jazz Chronicle
and displays the result in the Message window:
-- Lingo syntax
put(member("Jazz Chronicle").trackCount())
// JavaScript syntax
trace(member("Jazz Chronicle").trackCount());
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

