## trackType (Sprite)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 52554-52585

### Usage
```lingo
spriteObjRef.trackType(whichTrack)
spriteObjRef.trackType(whichTrack);
```

### Description
Digital video sprite property; returns the type of media in the specified track of the specified
sprite. Possible values are #video, #sound, #text, and #music.
This property can be tested but not set.

### Parameters
None.

### Example
```lingo
The following handler checks whether track 5 of the digital video sprite assigned to channel 10 is
a text track and runs the handler textFormat if it is:
-- Lingo syntax
on checkForText

trackType (Sprite) 1055

if sprite(10).trackType(5) = #text then
textFormat
end if
end
// JavaScript syntax
function checkForText() {
var tt = sprite(10).trackType(5);
if (tt = "text") {
textFormat();
}
}
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/core/sprite-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/sprite-ref.test.js`
- **Dependencies**: None (part of SpriteRef class)

