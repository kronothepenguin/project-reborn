## volume (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 54126-54144

### Usage
```lingo
memberObjRef.volume
memberObjRef.volume;
```

### Description
Shockwave Audio (SWA) cast member property; determines the volume of the specified SWA
streaming cast member. Values range from 0 to 255.
This property can be tested and set.

### Parameters
None.

### Example
```lingo
This statement sets the volume of an SWA streaming cast member to half the possible volume:
-- Lingo syntax
member("SWAfile").volume = 128
// JavaScript syntax
member("SWAfile").volume = 128;
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

