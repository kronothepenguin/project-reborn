## preLoad (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 46738-46767

### Usage
```lingo
memberObjRef.preLoad
memberObjRef.preLoad;
```

### Description
Cast member property; determines whether the digital video cast member specified by
whichCastMember can be preloaded into memory (TRUE) or not (FALSE, default). The TRUE
status has the same effect as selecting Enable Preload in the Digital Video Cast Member
Properties dialog box.
For Flash movie cast members, this property controls whether a Flash movie must load entirely
into RAM before the first frame of a sprite is displayed (TRUE), or whether the movie can stream
into memory as it plays (FALSE, default). This property works only for linked Flash movies whose
assets are stored in an external file; it has no effect on members whose assets are stored in the cast.
The streamMode and bufferSize properties determine how the cast member is streamed into
memory.
This property can be tested and set.

### Parameters
None.

### Example
```lingo
This statement reports in the Message window whether the QuickTime movie Rotating Chair can
be preloaded into memory:
-- Lingo syntax
put(member("Rotating Chair").preload)
// JavaScript syntax
put(member("Rotating Chair").preload);
```

### See also
bufferSize, streamMode

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

