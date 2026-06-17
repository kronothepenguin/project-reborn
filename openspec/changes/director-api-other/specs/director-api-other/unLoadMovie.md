## unLoadMovie()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29330-29371

### Usage
```lingo
_movie.unLoadMovie(stringMovieName)
_movie.unLoadMovie(stringMovieName);
```

### Description
Movie method; removes the specified preloaded movie from memory.
This command is useful in forcing movies to unload when memory is low.
You can use a URL as the file reference.
If the movie isn’t already in RAM, the result is -1.

572

Chapter 12: Methods

### Parameters
stringMovieName Required. A string that specifies the name of the movie to unload

from memory.

### Example
```lingo
This statement checks whether the largest contiguous block of free memory is less than 100K and
unloads the movie Parsifal if it is:
-- Lingo syntax
if (_system.freeBlock < (100*1024)) then
_movie.unLoadMovie("Parsifal")
end if
// JavaScript syntax
if (_system.freeBlock < (100*1024)) {
_movie.unLoadMovie("Parsifal");
}

This statement unloads the movie at http://www.cbDemille.com/SunsetBlvd.dir:
-- Lingo syntax
_movie.unLoadMovie("http://www.cbDemille.com/SunsetBlvd.dir")
// JavaScript syntax
_movie.unLoadMovie("http://www.cbDemille.com/SunsetBlvd.dir");
```

### See also
Movie

### Implementation
- **File**: `apps/client/src/director/api/unLoadMovie.js`
- **Test**: `apps/client/src/director/api/__tests__/unLoadMovie.test.js`
- **Dependencies**: Various (depends on function)

