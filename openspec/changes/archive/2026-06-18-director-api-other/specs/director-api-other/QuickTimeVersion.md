## QuickTimeVersion()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25202-25226

### Usage
```lingo
QuickTimeVersion()
QuickTimeVersion();
```

### Description
Function; returns a floating-point value that identifies the current installed version of QuickTime
and replaces the current QuickTimePresent function.
In Windows, if multiple versions of QuickTime 3.0 or later are installed, QuickTimeVersion()
returns the latest version number. If a version before QuickTime 3.0 is installed,
QuickTimeVersion() returns version number 2.1.2 regardless of the version installed.

### Parameters
None.

### Example
```lingo
This statement uses QuickTimeVersion() to display in the Message window the version of
QuickTime that is currently installed:
-- Lingo syntax
put(QuickTimeVersion())
// JavaScript syntax
put(QuickTimeVersion());
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/QuickTimeVersion.js`
- **Test**: `apps/client/src/director/api/__tests__/QuickTimeVersion.test.js`
- **Dependencies**: Various (depends on function)

