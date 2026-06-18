## maximize()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20388-20418

### Usage
```lingo
windowObjRef.maximize()
windowObjRef.maximize();
```

### Description
Window method; maximizes a window.
Use this method when making custom titlebars.

### Parameters
None.

### Example
```lingo
These statements maximize the window named Artists if it is not already maximized.
-- Lingo syntax
if (window("Artists").sizeState <> #maximized) then
window("Artists").maximize()
end if
// JavaScript syntax
if (window("Artists").sizeState != symbol("maximized")) {
window("Artists").maximize();
}
```

### See also
minimize(), Window

maximize()

393

### Implementation
- **File**: `apps/client/src/director/api/maximize.js`
- **Test**: `apps/client/src/director/api/__tests__/maximize.test.js`
- **Dependencies**: Various (depends on function)

