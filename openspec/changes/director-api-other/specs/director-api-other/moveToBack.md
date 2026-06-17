## moveToBack()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 21035-21068

### Usage
```lingo
windowObjRef.moveToBack()
windowObjRef.moveToBack();
```

### Description
Window method; moves a window behind all other windows.

### Parameters
None.

### Example
```lingo
These statements move the first window in windowList behind all other windows:
-- Lingo syntax
myWindow = _player.windowList[1]
myWindow.moveToBack()
// JavaScript syntax
var myWindow = _player.windowList[1];
myWindow.moveToBack();

If you know the name of the window you want to move, use the syntax:
-- Lingo syntax
window("Demo Window").moveToBack()
// JavaScript syntax
window("Demo Window").moveToBack();
```

### See also
moveToFront(), Window

406

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/moveToBack.js`
- **Test**: `apps/client/src/director/api/__tests__/moveToBack.test.js`
- **Dependencies**: Various (depends on function)

