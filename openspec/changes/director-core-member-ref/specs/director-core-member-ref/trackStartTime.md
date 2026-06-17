## trackStartTime (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 52407-52430

### Usage
```lingo
memberObjRef.trackStartTime(whichTrack)
memberObjRef.trackStartTime(whichTrack);
```

### Description
Digital video cast member property; returns the start time of the specified track of the specified
digital video cast member.
This property can be tested but not set.

### Parameters
None.

### Example
```lingo
This statement determines the start time of track 5 in the digital video cast member Jazz
Chronicle and displays the result in the Message window:
-- Lingo syntax
put(member("Jazz Chronicle").trackStartTime(5))
// JavaScript syntax
put(member("Jazz Chronicle").trackStartTime(5));

1052

Chapter 14: Properties
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

