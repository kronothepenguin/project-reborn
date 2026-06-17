## height

**Source**: `docs/drmx2004_scripting_ref.txt` lines 40097-40132

### Usage
```lingo
imageObjRef.height
memberObjRef.height
spriteObjRef.height
imageObjRef.height;
memberObjRef.height;
spriteObjRef.height;
```

### Description
Image, Member, and Sprite property; for vector shape, Flash, animated GIF, RealMedia,
Windows Media, bitmap, and shape cast members, determines the height, in pixels, of the
cast member displayed on the Stage. Read-only for cast members and image objects, read/write
for sprites.

### Parameters
None.

### Example
```lingo
This statement assigns the height of cast member Headline to the variable vHeight:
-- Lingo syntax
vHeight = member("Headline").height
// JavaScript syntax
var vHeight = member("Headline").height;

height

795

This statement sets the height of sprite 10 to 26 pixels:
-- Lingo syntax
sprite(10).height = 26
// JavaScript syntax
sprite(10).height = 26;
```

### See also
Member, Sprite, width

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

