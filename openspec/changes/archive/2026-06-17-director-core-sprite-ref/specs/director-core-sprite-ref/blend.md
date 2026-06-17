## blend (Sprite)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 33370-33402

### Usage
```lingo
spriteObjRef.blend
spriteObjRef.blend;
```

### Description
Sprite property; returns or sets a sprite’s blend value, from 0 to 100, corresponding to the blend
values in the Sprite Properties dialog box. Read/write.
The possible colors depend on the colors available in the palette, regardless of the monitor’s
color depth.
For best results, use the blend ink with images that have a color depth greater than 8-bit.

### Parameters
None.

### Example
```lingo
The following statement sets the blend value of sprite 3 to 40 percent.
-- Lingo syntax
sprite(3).blend = 40
// JavaScript syntax
sprite(3).blend = 40;

This statement displays the blend value of sprite 3 in the Message window:
-- Lingo syntax
put(sprite(3).blend)
// JavaScript syntax
put(sprite(3).blend);
```

### See also
blendLevel, Sprite

blend (Sprite)

657

### Implementation
- **File**: `apps/client/src/director/core/sprite-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/sprite-ref.test.js`
- **Dependencies**: None (part of SpriteRef class)

