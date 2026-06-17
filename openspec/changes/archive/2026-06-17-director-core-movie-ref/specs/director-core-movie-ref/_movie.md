## _movie

**Source**: `docs/drmx2004_scripting_ref.txt` lines 31497-31528

### Usage
```lingo
_movie
_movie;
```

### Description
Top-level property; provides a reference to the Movie object, which represents the currently active
movie within the Director player, and provides access to properties and methods that are available
on a movie level. Read-only.

### Parameters
None.

### Example
```lingo
This statement sets the variable objMovie to the _movie property:
-- Lingo syntax
objMovie = _movie
// JavaScript syntax
var objMovie = _movie;

This statement uses the _movie property directly to access the value of the displayTemplate
property:
-- Lingo syntax
theTemplate = _movie.displayTemplate
// JavaScript syntax
var theTemplate = _movie.displayTemplate;
```

### See also
Movie

_movie

619

### Implementation
- **File**: `apps/client/src/director/core/movie-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: None (part of MovieRef class)

