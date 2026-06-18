## minimize()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20663-20689

### Usage
```lingo
windowObjRef.minimize()
windowObjRef.minimize();
```

### Description
Window method; minimizes a window.
Use this method when making custom titlebars.

### Parameters
None.

### Example
```lingo
These statements minimize the window named Artists if it is not already minimized.
-- Lingo syntax
if (window("Artists").sizeState <> #minimized) then
window("Artists").minimize()
end if
// JavaScript syntax
if (window("Artists").sizeState != symbol("minimized")) {
window("Artists").minimized();
}
```

### See also
maximize(), Window

### Implementation
- **File**: `apps/client/src/director/api/minimize.js`
- **Test**: `apps/client/src/director/api/__tests__/minimize.test.js`
- **Dependencies**: Various (depends on function)

