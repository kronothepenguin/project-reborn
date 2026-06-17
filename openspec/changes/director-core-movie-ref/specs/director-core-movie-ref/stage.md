## stage

**Source**: `docs/drmx2004_scripting_ref.txt` lines 50229-50250

### Usage
```lingo
_movie.stage
_movie.stage;
```

### Description
Movie property; refers to the main movie. Read-only.
This property is useful when sending a message to the main movie from a child movie.

### Parameters
None.

### Example
```lingo
This statement displays the current setting for the Stage:
-- Lingo syntax
put(_movie.stage.rect)
// JavaScript syntax
put(_movie.stage.rect);
```

### See also
Movie

stage 1007

### Implementation
- **File**: `apps/client/src/director/core/movie-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: None (part of MovieRef class)

