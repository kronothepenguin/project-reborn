## goPrevious()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 18103-18131

### Usage
```lingo
_movie.goPrevious()
_movie.goPrevious();
```

### Description
Movie method; sends the playhead to the previous marker in the movie.
This marker is two markers back from the current frame if the current frame does not have a
marker or one marker back from the current frame if the current frame has a marker.
If no markers are to the left of the playhead, the playhead branches to one of the following:

• The next marker to the right if the current frame does not have a marker
• The current frame if the current frame has a marker
• Frame 1 if the movie contains no markers

### Parameters
None.

### Example
```lingo
This statement sends the playhead to the previous marker in the movie:
-- Lingo syntax
_movie.goPrevious()
// JavaScript syntax
_movie.goPrevious();
```

### See also
go(), goLoop(), goNext(), Movie

### Implementation
- **File**: `apps/client/src/director/api/goPrevious.js`
- **Test**: `apps/client/src/director/api/__tests__/goPrevious.test.js`
- **Dependencies**: Various (depends on function)

