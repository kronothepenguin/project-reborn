## cacheDocVerify()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12774-12820

### Usage
```lingo
cacheDocVerify #setting
cacheDocVerify()
cacheDocVerify symbol(setting);
cacheDocVerify();
```

### Description
Function; sets how often the contents of a page on the Internet are refreshed with information
from the projector’s cache.
The form cacheDocVerify() returns the current setting of the cache.
The cacheDocVerify function is valid only for movies running in Director or as projectors. This
function is not valid for movies with Macromedia Shockwave content because they use the
network settings of the browser in which they run.
-- Lingo syntax
on resetCache
current = cacheDocVerify()
if current = #once then
alert "Turning cache verification on"
cacheDocVerify #always
end if
end

248

Chapter 12: Methods

// JavaScript syntax
function resetCache() {
current = cacheDocVerify();
if (current == symbol("once")) {
alert("Turning cache verification on");
cacheDocVerify(symbol("always"))
}
}

### Parameters
cacheSetting Optional. A symbol that specifies how often the contents of a page on the Internet
are refreshed. Possible values are #once (default) and #always. Specifying #once tells a movie to

get a file from the Internet once and then use the file from the cache without looking for an
updated version on the Internet. Specifying #always tells a movie to try to get an updated version
of the file each time the movie calls a URL.

### Example
```lingo

```

### See also
cacheSize(), clearCache

### Implementation
- **File**: `apps/client/src/director/api/cacheDocVerify.js`
- **Test**: `apps/client/src/director/api/__tests__/cacheDocVerify.test.js`
- **Dependencies**: Various (depends on function)

