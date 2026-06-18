## beginRecording()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12431-12497

### Usage
```lingo
_movie.beginRecording()
_movie.beginRecording();
```

### Description
Movie method; starts a Score generation session.
When you call beginRecording(), the playhead automatically advances one frame and begins
recording in that frame. To avoid this behavior and begin recording in the frame in which
beginRecording() is called, place a statement such as _movie.go(_movie.frame - 1) between
the calls to beginRecording() and endRecording().
Only one update session in a movie can be active at a time.
Every call to beginRecording() must be matched by a call to endRecording(), which ends the
Score generation session.

### Parameters
None.

### Example
```lingo
When used in the following handler, the beginRecording keyword begins a Score generation
session that animates the cast member Ball by assigning the cast member to sprite channel 20 and
then moving the sprite horizontally and vertically over a series of frames. The number of frames is
determined by the argument numberOfFrames.
-- Lingo syntax
on animBall(numberOfFrames)
_movie.beginRecording()
horizontal = 0
vertical = 100
repeat with i = 1 to numberOfFrames
_movie.go(i)
sprite(20).member = member("Ball")
sprite(20).locH = horizontal
sprite(20).locV = vertical
sprite(20).foreColor = 255
horizontal = horizontal + 3
vertical = vertical + 2
_movie.updateFrame()
end repeat
_movie.endRecording()
end animBall

242

Chapter 12: Methods

// JavaScript syntax
function animBall(numberOfFrames) {
_movie.beginRecording();
var horizontal = 0;
var vertical = 100;
for (var i = 1; i <= numberOfFrames; i++) {
_movie.go(1);
sprite(20).member = member("Ball");
sprite(20).locH = horizontal;
sprite(20).locV = vertical;
sprite(20).foreColor = 255;
horizontal = horizontal + 3;
vertical = vertical + 2;
_movie.updateFrame();
}
_movie.endRecording();
}
```

### See also
endRecording(), Movie

### Implementation
- **File**: `apps/client/src/director/api/beginRecording.js`
- **Test**: `apps/client/src/director/api/__tests__/beginRecording.test.js`
- **Dependencies**: Various (depends on function)

