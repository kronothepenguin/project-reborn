## foreColor

**Source**: `docs/drmx2004_scripting_ref.txt` lines 39510-39538

### Usage
```lingo
spriteObjRef.foreColor
spriteObjRef.foreColor;
```

### Description
Sprite property; returns or sets the foreground color of a sprite. Read/write.
It is not recommended to apply this property to bitmap cast members deeper than 1-bit, as the
results are difficult to predict.
It is recommended that the newer color property be used instead of the foreColor property.

### Parameters
None.

### Example
```lingo
The following statement sets the variable oldColor to the foreground color of sprite 5:
-- Lingo syntax
oldColor = sprite(5).foreColor
// JavaScript syntax
var oldColor = sprite(5).foreColor;

The following statement makes 36 the number for the foreground color of a random sprite from
sprites 11 to 13:
-- Lingo syntax
sprite(10 + random(3)).foreColor = 36
// JavaScript syntax
sprite(10 + random(3)).foreColor = 36;
```

### See also
backColor, color(), Sprite

### Implementation
- **File**: `apps/client/src/director/core/sprite-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/sprite-ref.test.js`
- **Dependencies**: None (part of SpriteRef class)

