## insertFrame()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19169-19216

### Usage
```lingo
_movie.insertFrame()
_movie.insertFrame();
```

### Description
Movie method; duplicates the current frame and its content.
The duplicate frame is inserted after the current frame and then becomes the current frame.
This method can be used only during a Score recording session and performs the same function as
the duplicateFrame() method.

insertFrame()

367

### Parameters
None.

### Example
```lingo
The following handler generates a frame that has the transition cast member Fog assigned in the
transition channel followed by a set of empty frames. The argument numberOfFrames sets the
number of frames.
-- Lingo syntax
on animBall(numberOfFrames)
_movie.beginRecording()
_movie.frameTransition = member("Fog").number
_movie.go(_movie.frame + 1)
repeat with i = 0 to numberOfFrames
_movie.insertFrame()
end repeat
_movie.endRecording()
end animBall
// JavaScript syntax
function animBall(numberOfFrames) {
_movie.beginRecording();
_movie.frameTransition = member("Fog").number;
_movie.go(_movie.frame + 1);
for (var i = 0; i <= numberOfFrames; i++) {
_movie.insertFrame();
}
_movie.endRecording();
}
```

### See also
duplicateFrame(), Movie

### Implementation
- **File**: `apps/client/src/director/api/insertFrame.js`
- **Test**: `apps/client/src/director/api/__tests__/insertFrame.test.js`
- **Dependencies**: Various (depends on function)

