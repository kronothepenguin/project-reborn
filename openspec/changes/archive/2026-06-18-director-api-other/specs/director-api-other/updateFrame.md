## updateFrame()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29414-29475

### Usage
```lingo
_movie.updateFrame()
_movie.updateFrame();
```

### Description
Movie method; during Score generation only, enters the changes to the current frame that have
been made during Score recording and moves to the next frame. Any objects that were already in
the frame when the update session started remain in the frame. You must issue an
updateFrame() method for each frame that you are updating.

### Parameters
None.

### Example
```lingo
When used in the following handler, the updateFrame command enters the changes that have
been made to the current frame and moves to the next frame each time Lingo reaches the end of
the repeat loop. The number of frames is determined by the argument numberOfFrames.
-- Lingo syntax
on animBall(numberOfFrames)
_movie.beginRecording()
horizontal = 0
vertical = 100
repeat with i = 1 to numberOfFrames
_movie.go(i)
sprite(20).member = member("Ball").number
sprite(20).locH = horizontal
sprite(20).locV = vertical
sprite(20).foreColor = 255
horizontal = horizontal + 3
vertical = vertical + 2
_movie.updateFrame()
end repeat
_movie.endRecording()
end animBall

574

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
beginRecording(), endRecording(), Movie, scriptNum, tweened

### Implementation
- **File**: `apps/client/src/director/api/updateFrame.js`
- **Test**: `apps/client/src/director/api/__tests__/updateFrame.test.js`
- **Dependencies**: Various (depends on function)

