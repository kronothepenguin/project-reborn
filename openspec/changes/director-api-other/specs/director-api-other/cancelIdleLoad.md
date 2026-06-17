## cancelIdleLoad()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13120-13142

### Usage
```lingo
_movie.cancelIdleLoad(intLoadTag)
_movie.cancelIdleLoad(intLoadTag);
```

### Description
Movie method; cancels the loading of all cast members that have the specified load tag.

### Parameters
intLoadTag Required. An integer that specifies a group of cast members that have been queued

for loading when the computer is idle.

### Example
```lingo
This statement cancels the loading of cast members that have an idle load tag of 20:
-- Lingo syntax
_movie.cancelIdleLoad(20)
// JavaScript syntax
_movie.cancelIdleLoad(20);
```

### See also
idleLoadTag, Movie

### Implementation
- **File**: `apps/client/src/director/api/cancelIdleLoad.js`
- **Test**: `apps/client/src/director/api/__tests__/cancelIdleLoad.test.js`
- **Dependencies**: Various (depends on function)

