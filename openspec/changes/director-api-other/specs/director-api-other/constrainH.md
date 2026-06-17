## constrainH()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13792-13844

### Usage
```lingo
_movie.constrainH(intSpriteNum, intPosn)
_movie.constrainH(intSpriteNum, intPosn);
```

### Description
Movie method; returns an integer whose value depends on the horizontal coordinates of the left
and right sides of a sprite.
The returned integer can be one of three possible values.

• If the intPosn parameter is between the values of the sprite’s left and right coordinates, the
returned integer equals intPosn.

• If the intPosn parameter is less than the value of the sprite’s left coordinate, the returned
integer changes to the value of the sprite’s left coordinate.
• If the intPosn parameter is greater than the value of the sprite’s right coordinate, the returned
integer changes to the value of the sprite’s right coordinate.
This method does not change the sprite’s properties.
Both the constrainH() and constrainV() methods constrain only one axis each.

constrainH()

269

### Parameters
intSpriteNum Required. An integer that specifies the sprite whose horizontal coordinates are
evaluated against intPosn.
intPosn Required. An integer to be evaluated against by the horizontal coordinates of the left and
right sides of the sprite identified by intSpriteNum.

### Example
```lingo
These statements check the constrainH function for sprite 1 when it has left and right
coordinates of 40 and 60:
-- Lingo syntax
put(constrainH(1, 20)) -- 40
put(constrainH(1, 55)) -- 55
put(constrainH(1, 100)) -- 60
// JavaScript syntax
put(constrainH(1, 20)); // 40
put(constrainH(1, 55)); // 55
put(constrainH(1, 100)); // 60

This statement constrains a moveable slider (sprite 1) to the edges of a gauge (sprite 2) when the
mouse pointer goes past the edge of the gauge:
-- Lingo syntax
sprite(1).locH = _movie.constrainH(2, _mouse.mouseH)
// JavaScript syntax
sprite(1).locH = _movie.constrainH(2, _mouse.mouseH);
```

### See also
constrainV(), Movie

### Implementation
- **File**: `apps/client/src/director/api/constrainH.js`
- **Test**: `apps/client/src/director/api/__tests__/constrainH.test.js`
- **Dependencies**: Various (depends on function)

