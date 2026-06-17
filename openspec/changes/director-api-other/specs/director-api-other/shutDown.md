## shutDown()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27944-27962

### Usage
```lingo
_system.shutDown()
_system.shutDown();
```

### Description
System method; closes all open applications and turns off the computer.

### Parameters
None.

### Example
```lingo
This statement checks whether the user has pressed Control+S (Windows) or Command+S
(Macintosh) and, if so, shuts down the computer:
```

### See also
System

### Implementation
- **File**: `apps/client/src/director/api/shutDown.js`
- **Test**: `apps/client/src/director/api/__tests__/shutDown.test.js`
- **Dependencies**: Various (depends on function)

