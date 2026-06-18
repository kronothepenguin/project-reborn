## idleLoadDone()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 18553-18580

### Usage
```lingo
_movie.idleLoadDone(intLoadTag)
_movie.idleLoadDone(intLoadTag);
```

### Description
Movie method; reports whether all cast members with the given tag have been loaded (TRUE) or
are still waiting to be loaded (FALSE).

### Parameters
intLoadTag Required. An integer that specifies the load tag for the cast members to test.

### Example
```lingo
This statement checks whether all cast members whose load tag is 20 have been loaded and then
plays the movie Kiosk if they are:
-- Lingo syntax
if (_movie.idleLoadDone(20)) then
_movie.play(1, "Kiosk")
end if
// JavaScript syntax
if (_movie.idleLoadDone(20)) {
_movie.play(1, "Kiosk");
}
```

### See also
idleHandlerPeriod, idleLoadMode, idleLoadPeriod, idleLoadTag,
idleReadChunkSize, Movie

### Implementation
- **File**: `apps/client/src/director/api/idleLoadDone.js`
- **Test**: `apps/client/src/director/api/__tests__/idleLoadDone.test.js`
- **Dependencies**: Various (depends on function)

