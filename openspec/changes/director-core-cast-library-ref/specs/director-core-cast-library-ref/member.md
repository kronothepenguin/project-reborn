## member (Cast)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 42921-42948

### Usage
```lingo
castObjRef.member[memberNameOrNum]
castObjRef.member[memberNameOrNum]
```

### Description
Cast library property; provides indexed or named access to the members of a cast library.
Read-only.
The memberNameOrNum argument can be a string that specifies the cast member by name or an
integer that specifies the cast member by number.

### Parameters
None.

### Example
```lingo
The following example provides access to the second cast member in the cast library named
Internal.
-- Lingo syntax
myMember = castLib("Internal").member[2]

member (Cast)

853

// JavaScript syntax
var myMember = castLib("Internal").member[2];
```

### See also
Cast Library

### Implementation
- **File**: `apps/client/src/director/core/cast-library-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/cast-library-ref.test.js`
- **Dependencies**: None (part of CastLibraryRef class)

