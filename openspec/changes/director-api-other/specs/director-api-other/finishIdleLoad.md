## finishIdleLoad()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16312-16338

### Usage
```lingo
_movie.finishIdleLoad(intLoadTag)
_movie.finishIdleLoad(intLoadTag);
```

### Description
Movie method; forces completion of loading for all the cast members that have the specified
load tag.

### Parameters
intLoadTag Required. An integer that specifies the load tag of the cast members to be loaded.

### Example
```lingo
This statement completes the loading of all cast members that have the load tag 20:
-- Lingo syntax
_movie.finishIdleLoad(20)
// JavaScript syntax
_movie.finishIdleLoad(20);
```

### See also
idleHandlerPeriod, idleLoadDone(), idleLoadMode, idleLoadPeriod, idleLoadTag,
idleReadChunkSize, Movie

finishIdleLoad()

315

### Implementation
- **File**: `apps/client/src/director/api/finishIdleLoad.js`
- **Test**: `apps/client/src/director/api/__tests__/finishIdleLoad.test.js`
- **Dependencies**: Various (depends on function)

