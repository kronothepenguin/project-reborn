## trackType (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 52525-52553

### Usage
```lingo
memberObjRef.trackType(whichTrack)
memberObjRef.trackType(whichTrack);
```

### Description
Digital video cast member property; indicates which type of media is in the specified track of the
specified cast member. Possible values are #video, #sound, #text, and #music.
This property can be tested but not set.

### Parameters
None.

### Example
```lingo
The following handler checks whether track 5 of the digital video cast member Today’s News is a
text track and then runs the handler textFormat if it is:
-- Lingo syntax
on checkForText
if member("Today's News").trackType(5) = #text then
textFormat
end if
end
// JavaScript syntax
function checkForText() {
var tt = member("Today's News").trackType(5);
if (tt = "text") {
textFormat();
}
}
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

