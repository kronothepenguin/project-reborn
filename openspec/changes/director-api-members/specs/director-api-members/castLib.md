## castLib()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13143-13172

### Usage
```lingo
castLib(castNameOrNum)
castLib(castNameOrNum);
```

### Description
Top level function; returns a reference to a specified cast library.

castLib()

255

The default cast library number is 1. To specify a cast member in a cast library other than cast 1,
set castLib() to specify the alternative cast library.

### Parameters
castNameOrNum Required. A string that specifies the cast library name, or an integer that specifies

the cast library number.

### Example
```lingo
This statement sets the variable parts to the second cast library:
-- Lingo syntax
parts = castLib(2)
// JavaScript syntax
var parts = castLib(2);
```

### See also
Cast Library, castLibNum

### Implementation
- **File**: `apps/client/src/director/api/castLib.js`
- **Test**: `apps/client/src/director/api/__tests__/castLib.test.js`
- **Dependencies**: director-core-member-ref, director-core-sprite-ref, director-core-cast-library-ref

