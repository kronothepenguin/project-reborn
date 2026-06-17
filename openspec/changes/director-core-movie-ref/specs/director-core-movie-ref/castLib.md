## castLib

**Source**: `docs/drmx2004_scripting_ref.txt` lines 34378-34405

### Usage
```lingo
_movie.castLib[castNameOrNum]
_movie.castLib[castNameOrNum];
```

### Description
Movie property; provides named or indexed access to the cast libraries of a movie, whether the
movie is active or not. Read-only.
The castNameOrNum argument can be either a string that specifies the name of the movie to
access or an integer that specifies the number of the movie to access.
This property provides functionality similar to the top level castLib() method, except that the
castLib() method applies only to the currently active movie.

### Parameters
None.

### Example
```lingo
This statement displays the number of the Buttons cast in the Message window.
-- Lingo syntax
put(_movie.castLib["Buttons"].number)
// JavaScript syntax
put(_movie.castLib["Buttons"].number);
```

### See also
castLib(), Movie

678

Chapter 14: Properties

### Implementation
- **File**: `apps/client/src/director/core/movie-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: None (part of MovieRef class)

