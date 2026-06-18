## showLocals()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27844-27862

### Usage
```lingo
showLocals()
```

### Description
Top level function (Lingo only); displays all local variables in the Message window. This
command is useful only within handlers or parent scripts that contain local variables to display.
All variables used in the Message window are automatically global.
Local variables in a handler are no longer available after the handler executes. Inserting
the statement showLocals() in a handler displays all the local variables in that handler in the
Message window.
This command is useful for debugging scripts.

### Parameters
None.

### Example
```lingo

```

### See also
clearGlobals(), global, showGlobals()

### Implementation
- **File**: `apps/client/src/director/api/showLocals.js`
- **Test**: `apps/client/src/director/api/__tests__/showLocals.test.js`
- **Dependencies**: Various (depends on function)

