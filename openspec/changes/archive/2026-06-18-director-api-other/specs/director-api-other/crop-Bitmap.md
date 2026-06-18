## crop() (Bitmap)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 14182-14211

### Usage
```lingo
memberObjRef.crop()
memberObjRef.crop();
```

### Description
Bitmap command; allows a bitmap cast member to be cropped to a specific size.
You can use crop to trim existing cast members, or in conjunction with the picture of the Stage to
grab a snapshot and then crop it to size for display.
The registration point is kept in the same location so the bitmap does not move in relation to the
original position.

### Parameters
rectToCropTo Required. Specifes the rectangle to which a cast member is cropped.

### Example
```lingo
This statement sets an existing bitmap member to a snapshot of the Stage, then crops the
resulting image to a rectangle equal to sprite 10:
-- Lingo syntax
stageImage = (_movie.stage).image
spriteImage = stageImage.crop(sprite(10).rect)
member("sprite snapshot").image = spriteImage
// JavaScript syntax
var stageImage = (_movie.stage).image;
var spriteImage = stageImage.crop(sprite(10).rect);
member("sprite snapshot").image = spriteImage;
```

### See also
picture (Member)

### Implementation
- **File**: `apps/client/src/director/api/crop-Bitmap.js`
- **Test**: `apps/client/src/director/api/__tests__/crop-Bitmap.test.js`
- **Dependencies**: Various (depends on function)

