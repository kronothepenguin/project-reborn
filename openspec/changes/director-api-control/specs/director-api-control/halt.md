## halt()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 18259-18290

### Usage
```lingo
_movie.halt()
_movie.halt();
```

### Description
Movie method; exits the current handler and any handler that called it and stops the movie
during authoring or quits the projector during runtime from a projector.

### Parameters
None.

### Example
```lingo
This statement checks whether the amount of free memory is less than 50K and, if it is, exits all
handlers that called it and then stops the movie:
-- Lingo syntax
if (_system.freeBytes < (50*1024)) then
_movie.halt()
end if
// JavaScript syntax
if (_system.freeBytes < (50*1024)) {
_movie.halt();
}
```

### See also
Movie

354

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/halt.js`
- **Test**: `apps/client/src/director/api/__tests__/halt.test.js`
- **Dependencies**: director-core-movie-ref

