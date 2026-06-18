## save castLib

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26643-26668

### Usage
```lingo

```

### Description
Command; saves changes to the cast in the cast’s original file or in a new file. Further operations
or references to the cast use the saved cast member.
This command does not work with compressed files.
The save CastLib command doesn’t support URLs as file references.

### Parameters
pathName&newFileName Optional. Specifies the path and file name to save to. If omitted, the

original cast must be linked.

### Example
```lingo
This statement causes Director to save the revised version of the Buttons cast in the new file
UpdatedButtons in the same folder:
castLib("Buttons").save(the moviePath & "UpdatedButtons.cst")
```

### See also
@ (pathname)

516

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/save-castLib.js`
- **Test**: `apps/client/src/director/api/__tests__/save-castLib.test.js`
- **Dependencies**: Various (depends on function)

