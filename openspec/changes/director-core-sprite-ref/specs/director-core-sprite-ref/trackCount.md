## trackCount (Sprite)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 52274-52295

### Usage
```lingo
spriteObjRef.trackCount()
spriteObjRef.trackCount();
```

### Description
Digital video sprite property; returns the number of tracks in the specified digital video sprite.
This property can be tested but not set.

trackCount (Sprite) 1049

### Parameters
None.

### Example
```lingo
This statement determines the number of tracks in the digital video sprite assigned to channel 10
and displays the result in the Message window:
-- Lingo syntax
put(sprite(10).trackCount())
// JavaScript syntax
trace(sprite(10).trackCount());
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/core/sprite-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/sprite-ref.test.js`
- **Dependencies**: None (part of SpriteRef class)

