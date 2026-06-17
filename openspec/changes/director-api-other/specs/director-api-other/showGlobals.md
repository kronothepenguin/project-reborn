## showGlobals()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27913-27943

### Usage
```lingo
_global.showGlobals()
_global.showGlobals();
```

### Description
Global method; displays all global variables in the Message window.
This method is useful for debugging scripts.

### Parameters
None.

### Example
```lingo
This statement displays all global variables in the Message window:
-- Lingo syntax
on mouseDown
_global.showGlobals()
end
// JavaScript syntax
function mouseDown() {
_global.showGlobals();
}
```

### See also
Global

542

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/showGlobals.js`
- **Test**: `apps/client/src/director/api/__tests__/showGlobals.test.js`
- **Dependencies**: Various (depends on function)

