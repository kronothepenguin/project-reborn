## clearFrame()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13482-13520

### Usage
```lingo
_movie.clearFrame()
_movie.clearFrame();
```

### Description
Movie method; clears all sprite channels in a frame during Score recording.

### Parameters
None.

### Example
```lingo
The following handler clears the content of each frame before it edits that frame during
Score generation:
-- Lingo syntax
on newScore
_movie.beginRecording()
repeat with counter = 1 to 50
_movie.clearFrame()
_movie.frameScript = 25
_movie.updateFrame()
end repeat
_movie.endRecording()
end
// JavaScript syntax
function newScore() {
_movie.beginRecording();
for (var i = 1; i <= 50; i++) {
_movie.clearFrame();
_movie.frameScript = 25;
_movie.updateFrame();
}
_movie.endRecording();
}
```

### See also
beginRecording(), endRecording(), Movie, updateFrame()

### Implementation
- **File**: `apps/client/src/director/api/clearFrame.js`
- **Test**: `apps/client/src/director/api/__tests__/clearFrame.test.js`
- **Dependencies**: Various (depends on function)

