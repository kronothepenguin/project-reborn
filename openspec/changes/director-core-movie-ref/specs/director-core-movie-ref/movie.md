## movie

**Source**: `docs/drmx2004_scripting_ref.txt` lines 44262-44282

### Usage
```lingo
windowObjRef.movie
windowObjRef.movie;
```

### Description
Window property; returns a reference to the movie object that is playing in a specified window.
Read-only.

### Parameters
None.

### Example
```lingo
This statement displays in the Message window the movie object that is playing in the window
named Empires:
-- Lingo syntax
trace(window("Empires").movie)
// JavaScript syntax
trace(window("Empires").movie);
```

### See also
Window

### Implementation
- **File**: `apps/client/src/director/core/movie-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: None (part of MovieRef class)

