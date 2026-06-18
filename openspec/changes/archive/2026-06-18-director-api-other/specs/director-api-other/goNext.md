## goNext()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 18075-18102

### Usage
```lingo
_movie.goNext()
_movie.goNext();
```

### Description
Movie method; sends the playhead to the next marker in the movie.
If no markers are to the right of the playhead, the playhead goes to the last marker in the movie or
to frame 1 if there are no markers in the movie.

### Parameters
None.

### Example
```lingo
This statement sends the playhead to the next marker in the movie:
-- Lingo syntax
_movie.goNext()
// JavaScript syntax
_movie.goNext();
```

### See also
go(), goLoop(), goPrevious(), Movie

350

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/goNext.js`
- **Test**: `apps/client/src/director/api/__tests__/goNext.test.js`
- **Dependencies**: Various (depends on function)

