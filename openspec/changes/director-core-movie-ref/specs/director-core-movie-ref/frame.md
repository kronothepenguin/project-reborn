## frame

**Source**: `docs/drmx2004_scripting_ref.txt` lines 39539-39562

### Usage
```lingo
_movie.frame
_movie.frame;
```

### Description
Movie property; returns the number of the current frame of the movie. Read-only.

### Parameters
None.

### Example
```lingo
This statement sends the playhead to the frame before the current frame:
-- Lingo syntax
_movie.go(_movie.frame - 1)

frame

783

// JavaScript syntax
_movie.go(_movie.frame - 1);
```

### See also
go(), Movie

### Implementation
- **File**: `apps/client/src/director/core/movie-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: None (part of MovieRef class)

