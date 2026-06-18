## duplicateFrame()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 15495-15540

### Usage
```lingo
_movie.duplicateFrame()
_movie.duplicateFrame();
```

### Description
Movie method; duplicates the current frame and its content, inserts the duplicate frame after the
current frame, and then makes the duplicate frame the current frame. This method can be used
during Score generation only.
This method performs the same function as the insertFrame() method.

### Parameters
None.

### Example
```lingo
When used in the following handler, the duplicateFrame command creates a series of frames
that have cast member Ball in the external cast Toys assigned to sprite channel 20. The number of
frames is determined by the argument numberOfFrames.
-- Lingo syntax
on animBall(numberOfFrames)
_movie.beginRecording()
sprite(20).member = member("Ball", "Toys")
repeat with i = 0 to numberOfFrames

300

Chapter 12: Methods

_movie.duplicateFrame()
end repeat
_movie.endRecording()
end animBall
// JavaScript syntax
function animBall(numberOfFrames) {
_movie.beginRecording();
sprite(20).member = member("Ball", "Toys");
for (var i = 0; i <= numberOfFrames; i++) {
_movie.duplicateFrame();
}
_movie.endRecording();
}
```

### See also
insertFrame(), Movie

### Implementation
- **File**: `apps/client/src/director/api/duplicateFrame.js`
- **Test**: `apps/client/src/director/api/__tests__/duplicateFrame.test.js`
- **Dependencies**: Various (depends on function)

