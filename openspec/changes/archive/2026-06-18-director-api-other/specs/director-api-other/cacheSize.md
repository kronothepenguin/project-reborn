## cacheSize()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12821-12862

### Usage
```lingo
cacheSize Size
cacheSize()
cacheSize(Size);
cacheSize();
```

### Description
Function and command; sets the cache size of Director.
The cacheSize function is valid only for movies running in Director or as projectors. This
function is not valid for movies with Shockwave content because they use the network settings of
the browser in which they run.

### Parameters
newCacheSize Optional. An integer that specifies the cache size, in kilobytes.

### Example
```lingo
This handler checks whether the browser’s cache setting is less than 1 MB. If it is, the handler
displays an alert and sets the cache size to 1 MB:
-- Lingo syntax
on checkCache if
cacheSize()<1000 then
alert "increasing cache to 1MB"
cacheSize 1000
end if
end

cacheSize()

249

// JavaScript syntax
function checkCache() {
if (cacheSize() < 1000) {
alert("increasing cache to 1MB");
cacheSize(1000);
}
}
```

### See also
cacheDocVerify(), clearCache

### Implementation
- **File**: `apps/client/src/director/api/cacheSize.js`
- **Test**: `apps/client/src/director/api/__tests__/cacheSize.test.js`
- **Dependencies**: Various (depends on function)

