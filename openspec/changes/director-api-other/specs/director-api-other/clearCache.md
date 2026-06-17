## clearCache

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13398-13426

### Usage
```lingo

```

### Description
Command; clears the Director network cache.
The clearCache command clears only the cache, which is separate from the browser’s cache.
If a file is in use, it remains in the cache until it is no longer in use.

### Parameters
None.

### Example
```lingo
This handler clears the cache when the movie starts:
-- Lingo syntax
on startMovie
clearCache
end
// JavaScript syntax
function startMovie() {
clearCache();
}
```

### See also
cacheDocVerify(), cacheSize()

clearCache

261

### Implementation
- **File**: `apps/client/src/director/api/clearCache.js`
- **Test**: `apps/client/src/director/api/__tests__/clearCache.test.js`
- **Dependencies**: Various (depends on function)

