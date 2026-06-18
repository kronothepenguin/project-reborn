## preLoad() (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23958-24001

### Usage
```lingo
memberObjRef.preLoad({toMemberObjRef})
memberObjRef.preLoad({toMemberObjRef});
```

### Description
Member method; preloads a cast member or a range of cast members into memory, and stops
preloading when memory is full or when all specified cast members have been preloaded.
When used without the toMemberObjRef parameter, preLoad() preloads all cast members used
from the current frame to the last frame of a movie.

### Parameters
toMemberObjRef Optional. A reference to the last cast member in a range of cast members that is
loaded into memory. The first cast member in the range is specified by memberObjRef.

preLoad() (Member)

465

### Example
```lingo
This statement reports in the Message window whether the QuickTime movie Rotating Chair can
be preloaded into memory:
-- Lingo syntax
put(member("Rotating Chair").preload())
// JavaScript syntax
put(member("Rotating Chair").preload());

This startMovie handler sets up a Flash movie cast member for streaming and then sets its
bufferSize property:
-- Lingo syntax
on startMovie
member("Flash Demo").preload = FALSE
member("Flash Demo").bufferSize = 65536
end
// JavaScript syntax
function startMovie() {
member("Flash Demo").preload = false;
member("Flash Demo").bufferSize = 65536;
}
```

### See also
Member

### Implementation
- **File**: `apps/client/src/director/api/preLoad-Member.js`
- **Test**: `apps/client/src/director/api/__tests__/preLoad-Member.test.js`
- **Dependencies**: Various (depends on function)

