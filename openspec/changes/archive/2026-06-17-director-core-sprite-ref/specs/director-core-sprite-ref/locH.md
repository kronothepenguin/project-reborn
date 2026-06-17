## locH

**Source**: `docs/drmx2004_scripting_ref.txt` lines 42096-42121

### Usage
```lingo
spriteObjRef.locH
spriteObjRef.locH;
```

### Description
Sprite property; indicates the horizontal position of a sprite’s registration point. Read/write.
Sprite coordinates are relative to the upper left corner of the Stage.
To make the value last beyond the current sprite, make the sprite a scripted sprite.

836

Chapter 14: Properties

### Parameters
None.

### Example
```lingo
This statement puts sprite 15 at the same horizontal location as the mouse click:
-- Lingo syntax
sprite(15).locH = _mouse.mouseH
// JavaScript syntax
sprite(15).locH = _mouse.mouseH;
```

### See also
bottom, height, left, locV, point(), right, Sprite, top, updateStage()

### Implementation
- **File**: `apps/client/src/director/core/sprite-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/sprite-ref.test.js`
- **Dependencies**: None (part of SpriteRef class)

