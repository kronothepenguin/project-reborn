## trackStopTime (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 52453-52473

### Usage
```lingo
memberObjRef.trackStopTime(whichTrack)
memberObjRef.trackStopTime(whichTrack);
```

### Description
Digital video cast member property; returns the stop time of the specified track of the specified
digital video cast member. It can be tested but not set.

### Parameters
None.

### Example
```lingo
This statement determines the stop time of track 5 in the digital video cast member Jazz
Chronicle and displays the result in the Message window:
-- Lingo syntax
put(member("Jazz Chronicle").trackStopTime(5))
// JavaScript syntax
put(member("Jazz Chronicle").trackStopTime(5));

trackStopTime (Member) 1053
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

