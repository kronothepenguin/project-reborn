## timeoutList

**Source**: `docs/drmx2004_scripting_ref.txt` lines 51863-51887

### Usage
```lingo
_movie.timeoutList
_movie.timeoutList;
```

### Description
Movie property; a linear list containing all currently active timeout objects. Read-only.
Use the forget() method to delete a timeout object.
Timeout objects are added to the timeoutList with the new() method.

### Parameters
None.

### Example
```lingo
This statement deletes the third timeout object from the timeout list:
-- Lingo syntax
_movie.timeoutList[3].forget()
// JavaScript syntax
_movie.timeoutList[3].forget();
```

### See also
forget() (Window), Movie, new(), forget() (Timeout), timeout()

timeoutList

1041

### Implementation
- **File**: `apps/client/src/director/core/movie-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: None (part of MovieRef class)

