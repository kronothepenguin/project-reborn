## restore()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26217-26239

### Usage
```lingo
windowObjRef.restore()
windowObjRef.restore();
```

### Description
Window method; restores a window after it has been maximized.
Use this method when making custom titlebars for movies in a window (MIAW).

### Parameters
None.

### Example
```lingo
This statement restores the maximized window named Control Panel:
-- Lingo syntax
window("Control Panel").restore()
// JavaScript syntax
window("Control Panel").restore();
```

### See also
maximize(), Window

### Implementation
- **File**: `apps/client/src/director/api/restore.js`
- **Test**: `apps/client/src/director/api/__tests__/restore.test.js`
- **Dependencies**: Various (depends on function)

