## visible

**Source**: `docs/drmx2004_scripting_ref.txt` lines 54038-54058

### Usage
```lingo
windowObjRef.visible
windowObjRef.visible;
```

### Description
Window property; determines whether a window is visible (TRUE) or not (FALSE). Read/write.

### Parameters
None.

### Example
```lingo
This statement makes the window named Control_Panel visible:
-- Lingo syntax
window("Control_Panel").visible = TRUE
// JavaScript syntax
window("Control_Panel").visible = true;
```

### See also
Window

visible 1085

### Implementation
- **File**: `apps/client/src/director/core/sprite-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/sprite-ref.test.js`
- **Dependencies**: None (part of SpriteRef class)

