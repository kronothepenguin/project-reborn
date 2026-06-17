## goLoop()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 18041-18074

### Usage
```lingo
_movie.goLoop()
_movie.goLoop();
```

### Description
Movie method; sends the playhead to the previous marker in the movie, either one marker back
from the current frame if the current frame does not have a marker, or to the current frame if the
current frame has a marker.

goLoop()

349

If no markers are to the left of the playhead, the playhead branches to:

• The next marker to the right if the current frame does not have a marker.
• The current frame if the current frame has a marker.
• Frame 1 if the movie contains no markers.

### Parameters
None.

### Example
```lingo
This statement causes the movie to loop between the current frame and the previous marker:
-- Lingo syntax
_movie.goLoop()
// JavaScript syntax
_movie.goLoop();
```

### See also
go(), goNext(), goPrevious(), Movie

### Implementation
- **File**: `apps/client/src/director/api/goLoop.js`
- **Test**: `apps/client/src/director/api/__tests__/goLoop.test.js`
- **Dependencies**: Various (depends on function)

