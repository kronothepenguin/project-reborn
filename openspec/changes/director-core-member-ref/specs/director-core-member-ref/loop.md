## loop (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 42303-42320

### Usage
```lingo
memberObjRef.loop
memberObjRef.loop;
```

### Description
Cast member property; determines whether the specified digital video, sound, or Flash movie cast
member is set to loop (TRUE) or not (FALSE).

### Parameters
None.

### Example
```lingo
This statement sets the QuickTime movie cast member Demo to loop:
-- Lingo syntax
member("Demo").loop = 1
// JavaScript syntax
member("Demo").loop = 1;
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

