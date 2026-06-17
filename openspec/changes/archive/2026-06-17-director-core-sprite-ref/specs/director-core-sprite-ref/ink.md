## ink

**Source**: `docs/drmx2004_scripting_ref.txt` lines 40907-41020

### Usage
```lingo
spriteObjRef.ink
spriteObjRef.ink;
```

### Description
Sprite property; determines the ink effect applied to a sprite. Read/write.
Valid values of ink are as follows:
0—Copy

32—Blend

1—Transparent

33—Add pin

2—Reverse

34—Add

3—Ghost

35—Subtract pin

4—Not copy

36—Background transparent

5—Not transparent

37—Lightest

6—Not reverse

38—Subtract

7—Not ghost

39—Darkest

8—Matte

40—Lighten

9—Mask

41—Darken

In the case of 36 (background transparent), you select a sprite in the Score and select a
transparency color from the background color box in the Tools window. You can also do this by
setting the backColor property.
If you set this property within a script while the playhead is not moving, be sure to use the Movie
object’s updateStage() method to redraw the Stage. If you change several sprite properties—or
several sprites—use only one updateStage() method at the end of all the changes.

### Parameters
None.

### Example
```lingo
This statement changes the variable currentInk to the value for the ink effect of sprite (3):
-- Lingo syntax
currentInk = sprite(3).ink
// JavaScript syntax
var currentInk = sprite(3).ink;

812

Chapter 14: Properties

This statement gives sprite (i + 1) a matte ink effect by setting the ink effect of the sprite property
to 8, which specifies matte ink:
-- Lingo syntax
sprite(i + 1).ink = 8
// JavaScript syntax
sprite(i + 1).ink = 8;
```

### See also
backColor, Sprite, updateStage()

inker (modifier)
Syntax
member(whichCastmember).modelResource(whichModelResource).\
inker.inkerModifierProperty
modelResourceObjectReference.inker.inkerModifierProperty

### Implementation
- **File**: `apps/client/src/director/core/sprite-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/sprite-ref.test.js`
- **Dependencies**: None (part of SpriteRef class)

