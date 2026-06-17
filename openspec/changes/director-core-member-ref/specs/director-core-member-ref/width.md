## width

**Source**: `docs/drmx2004_scripting_ref.txt` lines 54247-54288

### Usage
```lingo
memberObjRef.width
imageObjRef.width
spriteObjRef.width
memberObjRef.width;
imageObjRef.width;
spriteObjRef.width;
```

### Description
Member, Image, and Sprite property; for vector shape, Flash, animated GIF, RealMedia,
Windows Media, bitmap, and shape cast members, determines the width, in pixels, of a cast
member. Read-only for cast members and image objects, read/write for sprites.
This property does not affect field and button cast members.

### Parameters
None.

### Example
```lingo
This statement assigns the width of member 50 to the variable theHeight:
-- Lingo syntax
theHeight = member(50).width
// JavaScript syntax
var theHeight = member(50).width;

This statement sets the width of sprite 10 to 26 pixels:
-- Lingo syntax
sprite(10).width = 26
// JavaScript syntax
sprite(10).width = 26;

This statement assigns the width of sprite number i + 1 to the variable howWide:
-- Lingo syntax
howWide = sprite(i + 1).width
// JavaScript syntax
var howWide = sprite(i + 1).width;
```

### See also
height, image (Image), Member, Sprite

1090

Chapter 14: Properties

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

