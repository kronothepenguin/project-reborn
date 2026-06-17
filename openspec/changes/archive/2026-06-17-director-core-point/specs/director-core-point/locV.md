## locV

**Source**: `docs/drmx2004_scripting_ref.txt` lines 42149-42174

### Usage
```lingo
spriteObjRef.locV
spriteObjRef.locV;
```

### Description
Sprite property; indicates the vertical position of a sprite’s registration point. Read/write.

locV

837

Sprite coordinates are relative to the upper left corner of the Stage.
To make the value last beyond the current sprite, make the sprite a scripted sprite.

### Parameters
None.

### Example
```lingo
This statement puts sprite 15 at the same vertical location as the mouse click:
-- Lingo syntax
sprite(15).locV = _mouse.mouseV
// JavaScript syntax
sprite(15).locV = _mouse.mouseV;
```

### See also
bottom, height, left, locH, point(), right, Sprite, top, updateStage()

### Implementation
- **File**: `apps/client/src/director/core/point.js`
- **Test**: `apps/client/src/director/core/__tests__/point.test.js`
- **Dependencies**: None (part of Point class)

