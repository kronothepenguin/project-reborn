## editShortCutsEnabled

**Source**: `docs/drmx2004_scripting_ref.txt` lines 37897-37919

### Usage
```lingo
_movie.editShortCutsEnabled
_movie.editShortCutsEnabled;
```

### Description
Movie property; determines whether cut, copy, and paste operations and their keyboard shortcuts
function in the current movie. Read/write.
When set to TRUE, these text operations function. When set to FALSE, these operations are not
allowed. The default is TRUE for movies made in Director 8 and later, FALSE for movies made in
versions of Director prior to Director 8.

### Parameters
None.

### Example
```lingo
This statement disables cut, copy, and paste operations:
-- Lingo syntax
_movie.editShortCutsEnabled = 0
// JavaScript syntax
_movie.editShortCutsEnabled = 0;
```

### See also
Movie

### Implementation
- **File**: `apps/client/src/director/core/movie-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: None (part of MovieRef class)

