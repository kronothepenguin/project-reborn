## lastChannel

**Source**: `docs/drmx2004_scripting_ref.txt` lines 41516-41541

### Usage
```lingo
_movie.lastChannel
_movie.lastChannel;
```

### Description
Movie property; the number of the last channel in the movie, as entered in the Movie Properties
dialog box. Read-only.
To see an example of lastChannel used in a completed movie, see the QT and Flash movie in
the Learning/Lingo Examples folder inside the Director application folder.

### Parameters
None.

### Example
```lingo
This statement displays the number of the last channel of the movie in the Message window:
-- Lingo syntax
put(_movie.lastChannel)
// JavaScript syntax
put(_movie.lastChannel);
```

### See also
Movie

824

Chapter 14: Properties

### Implementation
- **File**: `apps/client/src/director/core/movie-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: None (part of MovieRef class)

