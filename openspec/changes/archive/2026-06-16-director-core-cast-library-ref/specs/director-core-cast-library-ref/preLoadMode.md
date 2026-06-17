## preLoadMode

**Source**: `docs/drmx2004_scripting_ref.txt` lines 46795-46824

### Usage
```lingo
castObjRef.preLoadMode
castObjRef.preLoadMode;
```

### Description
Cast library property; determines the preload mode of a specified cast library. Read/write.
Valid values of preLoadMode are:

• 0. Load the cast library when needed. This is the default value.
• 1. Load the cast library before frame 1.
• 2. Load the cast library after frame 1.
Setting this property has the same effect as setting Load Cast in the Cast Properties dialog box.

### Parameters
None.

### Example
```lingo
The following statement tells Director to load the members of the cast named Buttons before the
movie enters frame 1:
-- Lingo syntax
castLib("Buttons").preLoadMode = 1
// JavaScript syntax
castLib("Buttons").preLoadMode = 1;
```

### See also
Cast Library

preLoadMode

935

### Implementation
- **File**: `apps/client/src/director/core/cast-library-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/cast-library-ref.test.js`
- **Dependencies**: None (part of CastLibraryRef class)

