## constrainV()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13845-13896

### Usage
```lingo
_movie.constrainV(intSpriteNum, intPosn)
_movie.constrainV(intSpriteNum, intPosn);
```

### Description
Movie method; returns an integer whose value depends on the vertical coordinates of the top and
bottom sides of a sprite.
The returned integer can be one of three possible values.

• If the intPosn parameter is between the values of the sprite’s top and bottom coordinates, the
returned integer equals intPosn.
• If the intPosn parameter iis less than the value of the sprite’s top coordinate, the returned
integer changes to the value of the sprite’s top coordinate.
• If the intPosn parameter iis greater than the value of the sprite’s bottom coordinate, the
returned integer changes to the value of the sprite’s bottom coordinate.
This method does not change the sprite’s properties.

270

Chapter 12: Methods

Both the constrainV() and constrainH()s constrain only one axis each.

### Parameters
intSpriteNum Required. An integer that identifies the sprite whose vertical coordinates are
evaluated against intPosn.
intPosn Required. An integer to be evaluated against by the vertical coordinates of the left and
right sides of the sprite identified by intSpriteNum.

### Example
```lingo
These statements check the constrainV function for sprite 1 when it has top and bottom
coordinates of 40 and 60:
-- Lingo syntax
put(constrainV(1, 20)) -- 40
put(constrainV(1, 55)) -- 55
put(constrainV(1, 100)) -- 60
// JavaScript syntax
put(constrainV(1, 20)); // 40
put(constrainV(1, 55)); // 55
put(constrainV(1, 100)); // 60

This statement constrains a moveable slider (sprite 1) to the edges of a gauge (sprite 2) when the
mouse pointer moves past the edge of the gauge:
-- Lingo syntax
sprite(1).locV = _movie.constrainV(2, _mouse.mouseH)
// JavaScript syntax
sprite(1).locV = _movie.constrainV(2, _mouse.mouseH);
```

### See also
constrainH(), Movie

### Implementation
- **File**: `apps/client/src/director/api/constrainV.js`
- **Test**: `apps/client/src/director/api/__tests__/constrainV.test.js`
- **Dependencies**: Various (depends on function)

