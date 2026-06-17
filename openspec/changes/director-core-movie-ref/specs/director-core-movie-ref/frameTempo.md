## frameTempo

**Source**: `docs/drmx2004_scripting_ref.txt` lines 39836-39861

### Usage
```lingo
_movie.frameTempo
_movie.frameTempo;
```

### Description
Movie property; indicates the tempo assigned to the current frame. Read/write during a Score
recording session only.

frameTempo

789

### Parameters
None.

### Example
```lingo
The following statement checks the tempo used in the current frame. In this case, the tempo is 15
frames per second.
-- Lingo syntax
put(_movie.frameTempo)
// JavaScript syntax
put(_movie.frameTempo);
```

### See also
Movie, puppetTempo()

### Implementation
- **File**: `apps/client/src/director/core/movie-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: None (part of MovieRef class)

