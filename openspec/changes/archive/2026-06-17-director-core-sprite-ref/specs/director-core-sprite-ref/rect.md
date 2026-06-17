## rect (Sprite)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 47341-47365

### Usage
```lingo
spriteObjRef.rect
spriteObjRef.rect;
```

### Description
Sprite property; specifies the left, top, right, and bottom coordinates, as a rectangle, for the
rectangle of any graphic sprite such as a bitmap, shape, movie, or digital video. Read/write.

946

Chapter 14: Properties

### Parameters
None.

### Example
```lingo
This statement displays the coordinates of bitmap sprite 20:
-- Lingo syntax
put(sprite(20).rect)
// JavaScript syntax
put(sprite(20).rect);
```

### See also
rect(), Sprite

### Implementation
- **File**: `apps/client/src/director/core/sprite-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/sprite-ref.test.js`
- **Dependencies**: None (part of SpriteRef class)

