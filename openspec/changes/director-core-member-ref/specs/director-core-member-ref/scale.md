## scale (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 48382-48439

### Usage
```lingo
memberOrSpriteObjRef.scale
memberOrSpriteObjRef.scale;
```

### Description
Cast member property and sprite property; controls the scaling of a QuickTime, vector shape, or
Flash movie sprite.
For QuickTime, this property does not scale the sprite’s bounding rectangle or the sprite’s
controller. Instead, it scales the image around the image’s center point within the bounding
rectangle. The scaling is specified as a Director list containing two percentages stored as floatpoint values:
[xPercent, yPercent]

The xPercent parameter specifies the amount of horizontal scaling; the yPercent parameter
specifies vertical scaling.
When the sprite’s crop property is set to TRUE, the scale property can be used to simulate
zooming within the sprite’s bounding rectangle. When the sprite’s crop property is set to FALSE,
the scale property is ignored.
This property can be tested and set. The default value is [1.0000,1.0000].
For Flash movie or vector shape cast members, the scale is a floating-point value. The movie is
scaled from its origin point, as specified by its originMode property.
Note: This property must be set to the default value if the scaleMode property is set to #autoSize;
otherwise the sprite does not display correctly.

### Parameters
None.

### Example
```lingo
This handler accepts a reference to a Flash movie sprite as a parameter, reduces the movie’s
scale to 0% (so it disappears), and then scales it up again in 5% increments until it is full size
(100%) again:
-- Lingo syntax
on scaleMovie whichSprite
sprite(whichSprite).scale = 0
_movie.updatestage()
repeat with i = 1 to 20
sprite(whichSprite).scale = i * 5
_movie.updatestage()
end repeat
end
// JavaScript syntax
function scaleMovie(whichSprite) {
sprite(whichSprite).scale = 0;
_movie.updatestage();
var i = 1;
while (i < 21) {
sprite(whichSprite).scale = i * 5;
_movie.updatestage();
i++;

scale (Member)

969

}
}
```

### See also
scaleMode, originMode

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

