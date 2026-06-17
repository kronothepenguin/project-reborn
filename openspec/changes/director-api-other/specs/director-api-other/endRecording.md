## endRecording()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 15557-15615

### Usage
```lingo
_movie.endRecording()
_movie.endRecording();
```

### Description
Movie method; ends a Score update session.
You can resume control of Score channels through scripting after calling endRecording().

### Parameters
None.

endRecording()

301

### Example
```lingo
When used in the following handler, the endRecording keyword ends the Score
generation session:
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
beginRecording(), Movie, updateFrame()

### Implementation
- **File**: `apps/client/src/director/api/endRecording.js`
- **Test**: `apps/client/src/director/api/__tests__/endRecording.test.js`
- **Dependencies**: Various (depends on function)

