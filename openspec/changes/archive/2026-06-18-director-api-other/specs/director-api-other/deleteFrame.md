## deleteFrame()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 14877-14917

### Usage
```lingo
_movie.deleteFrame()
_movie.deleteFrame();
```

### Description
Movie method; deletes the current frame and makes the next frame the new current frame during
a Score generation session only.

### Parameters
None.

deleteFrame()

287

### Example
```lingo
The following handler checks whether the sprite in channel 10 of the current frame has gone past
the right edge of a 640-by-480-pixel Stage and deletes the frame if it has:
-- Lingo syntax
on testSprite
_movie.beginRecording()
if (sprite(10).locH > 640) then
_movie.deleteFrame()
end if
_movie.endRecording()
end
// JavaScript syntax
function testSprite() {
_movie.beginRecording();
if (sprite(10).locH > 640) {
_movie.deleteFrame();
}
_movie.endRecording();
}
```

### See also
beginRecording(), endRecording(), Movie, updateFrame()

### Implementation
- **File**: `apps/client/src/director/api/deleteFrame.js`
- **Test**: `apps/client/src/director/api/__tests__/deleteFrame.test.js`
- **Dependencies**: Various (depends on function)

