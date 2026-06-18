## restart()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26186-26216

### Usage
```lingo
_system.restart()
_system.restart();
```

### Description
System method; closes all open applications and restarts the computer.

### Parameters
None.

### Example
```lingo
This statement restarts the computer when the user presses Command+R (Macintosh) or
Control+R (Windows):
-- Lingo syntax
if (_key.key = "r" and _key.commandDown) then
_system.restart()
end if
// JavaScript syntax
if (_key.key = "r" && _key.commandDown) {
_system.restart();
}
```

### See also
System

restart()

507

### Implementation
- **File**: `apps/client/src/director/api/restart.js`
- **Test**: `apps/client/src/director/api/__tests__/restart.test.js`
- **Dependencies**: Various (depends on function)

