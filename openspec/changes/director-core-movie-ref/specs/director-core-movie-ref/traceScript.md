## traceScript

**Source**: `docs/drmx2004_scripting_ref.txt` lines 52228-52253

### Usage
```lingo
_movie.traceScript
_movie.traceScript;
```

### Description
Movie property; specifies whether the movie’s trace function is on (TRUE) or off (FALSE).
Read/write.
When traceScript is on, the Message window displays each line of script that is being executed.

1048

Chapter 14: Properties

### Parameters
None.

### Example
```lingo
This statement turns the traceScript property on.
-- Lingo syntax
_movie.traceScript = TRUE
// JavaScript syntax
_movie.traceScript = true;
```

### See also
Movie

### Implementation
- **File**: `apps/client/src/director/core/movie-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: None (part of MovieRef class)

