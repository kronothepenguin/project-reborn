## time() (System)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28915-28942

### Usage
```lingo
_system.time()
_system.time();
```

### Description
System method; returns the current time in the system clock as a string.
The returned time is formatted as follows:
1:30 PM

### Parameters
None.

### Example
```lingo
The following handler outputs the current time to a text field.
-- Lingo syntax
on exitFrame
member("clock").text = _system.time()
end
// JavaScript syntax
function exitFrame() {
member("clock").text = _system.time();
}
```

### See also
date() (System), System

### Implementation
- **File**: `apps/client/src/director/api/time-System.js`
- **Test**: `apps/client/src/director/api/__tests__/time-System.test.js`
- **Dependencies**: Various (depends on function)

