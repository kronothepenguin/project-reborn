## preLoadMovie()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24127-24152

### Usage
```lingo
_movie.preLoadMovie(stringMovieName)
_movie.preLoadMovie(stringMovieName);
```

### Description
Movie method; preloads the data and cast members associated with the first frame of the specified
movie. Preloading a movie helps it start faster when it is started by the go() or play() methods.
To preload cast members from a URL, use preloadNetThing() to load the cast members directly
into the cache, or use downloadNetThing() to load a movie on a local disk from which you can
load the movie into memory and minimize downloading time.

### Parameters
stringMovieName Required. A string that specifies the name of the movie to preload.

### Example
```lingo
This statement preloads the movie Introduction, which is located in the same folder as the
current movie:
-- Lingo syntax
_movie.preLoadMovie("Introduction")
// JavaScript syntax
_movie.preLoadMovie("Introduction");
```

### See also
downloadNetThing, go(), Movie, preloadNetThing()

### Implementation
- **File**: `apps/client/src/director/api/preLoadMovie.js`
- **Test**: `apps/client/src/director/api/__tests__/preLoadMovie.test.js`
- **Dependencies**: Various (depends on function)

