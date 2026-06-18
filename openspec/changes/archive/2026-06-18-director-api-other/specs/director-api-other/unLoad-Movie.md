## unLoad() (Movie)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29251-29277

### Usage
```lingo
_movie.unLoad({intFromFrameNum} {, intToFrameNum})
_movie.unLoad({intFromFrameNum} {, intToFrameNum});
```

### Description
Movie method; removes the specified preloaded movie from memory.
This command is useful in forcing movies to unload when memory is low.
You can use a URL as the file reference.
If the movie isn’t already in RAM, the result is -1.

### Parameters
intFromFrameNum Optional. An integer that specifies the number of the first frame in a range to
unload from memory.
intToFrameNum Optional. An integer that specifies the number of the last frame in a range to
unload from memory.

### Example
```lingo
The following statements unload frames 10 through 25 from memory.
-- Lingo syntax
_movie.unLoad(10, 25)
// JavaScript syntax
_movie.unLoad(10, 25);
```

### See also
Movie

### Implementation
- **File**: `apps/client/src/director/api/unLoad-Movie.js`
- **Test**: `apps/client/src/director/api/__tests__/unLoad-Movie.test.js`
- **Dependencies**: Various (depends on function)

