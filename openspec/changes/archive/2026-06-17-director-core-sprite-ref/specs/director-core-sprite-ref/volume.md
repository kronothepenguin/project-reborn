## volume (Sprite)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 54177-54202

### Usage
```lingo
spriteObjRef.volume
spriteObjRef.volume;
```

### Description
Sprite property; controls the volume of a digital video movie or Windows Media cast member
specified by name or number. The values range from 0 to 256. Values of 0 or less mute the sound.
Values exceeding 256 are loud and introduce considerable distortion.

### Parameters
None.

### Example
```lingo
This statement sets the volume of the QuickTime movie playing in sprite channel 7 to 256,
which is the maximum sound volume:
-- Lingo syntax
sprite(7).volume = 256
// JavaScript syntax
sprite(7).volume = 256;
```

### See also
soundLevel

1088

Chapter 14: Properties

### Implementation
- **File**: `apps/client/src/director/core/sprite-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/sprite-ref.test.js`
- **Dependencies**: None (part of SpriteRef class)

