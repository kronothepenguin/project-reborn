## backColor

**Source**: `docs/drmx2004_scripting_ref.txt` lines 32979-33022

### Usage
```lingo
spriteObjRef.backColor
spriteObjRef.backColor;
```

### Description
Sprite property; sets the background color of a specified sprite according to the color value
assigned. Read/write.
Setting backColor of a sprite is the same as choosing the background color from the Tool palette
when the sprite is selected on the Stage. For the value that a script sets to last beyond the current
sprite, the sprite must be a scripted sprite. The background color applies to all bitmap cast
members, in addition to field, button, check box, and radio cast members.
The backColor value ranges from 0 to 255 for 8-bit color and from 0 to 15 for 4-bit color.
The numbers correspond to the index number of the background color in the current palette.
(A color’s index number appears in the color palette’s lower left corner when you click the color.)
If this property is set on bitmap cast members that are deeper than 1-bit, the backColor may not
be seen if the background of the bitmap is not visible.
If the blend of a sprite is less than 100 but greater than 0, the backColor will mix with the
transparent colors.
Note: It is recommended that the newer bgColor property be used instead of the backColor property.

backColor

649

### Parameters
None.

### Example
```lingo
The following statement sets the variable oldColor to the background color of sprite 5:
-- Lingo syntax
oldColor = sprite(5).backColor
// JavaScript syntax
var oldColor = sprite(5).backColor;

The following statement randomly changes the background color of a random sprite between
sprites 11 and 13 to color number 36:
-- Lingo syntax
sprite(10 + random(3)).backColor = 36
// JavaScript syntax
sprite(10 + random(3)).backColor = 36;
```

### See also
Sprite

### Implementation
- **File**: `apps/client/src/director/core/sprite-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/sprite-ref.test.js`
- **Dependencies**: None (part of SpriteRef class)

