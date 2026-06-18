## clearGlobals()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13521-13553

### Usage
```lingo
_global.clearGlobals()
_global.clearGlobals();
```

### Description
Global method; sets all global variables to VOID (Lingo) or null (JavaScript syntax).

clearGlobals()

263

This method is useful when initializing global variables or when opening a new movie that
requires a new set of global variables.

### Parameters
None.

### Example
```lingo
The following handlers set all global variables to VOID (Lingo) or null (JavaScript):
-- Lingo syntax
on mouseDown
_global.clearGlobals()
end
// JavaScript syntax
function mouseDown() {
_global.clearGlobals();
}
```

### See also
Global

### Implementation
- **File**: `apps/client/src/director/api/clearGlobals.js`
- **Test**: `apps/client/src/director/api/__tests__/clearGlobals.test.js`
- **Dependencies**: Various (depends on function)

