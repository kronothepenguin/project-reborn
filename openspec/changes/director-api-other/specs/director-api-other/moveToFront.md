## moveToFront()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 21069-21098

### Usage
```lingo
windowObjRef.moveToFront()
windowObjRef.moveToFront();
```

### Description
Window method; moves a window in front of all other windows.

### Parameters
None.

### Example
```lingo
These statements move the first window in windowList in front of all other windows:
-- Lingo syntax
myWindow = _player.windowList[1]
myWindow.moveToFront()
// JavaScript syntax
var myWindow = _player.windowList[1];
myWindow.moveToFront();

If you know the name of the window you want to move, use the syntax:
-- Lingo syntax
window("Demo Window").moveToFront()
// JavaScript syntax
window("Demo Window").moveToFront();
```

### See also
moveToBack(), Window

### Implementation
- **File**: `apps/client/src/director/api/moveToFront.js`
- **Test**: `apps/client/src/director/api/__tests__/moveToFront.test.js`
- **Dependencies**: Various (depends on function)

