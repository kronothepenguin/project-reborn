## preLoad() (Movie)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24002-24057

### Usage
```lingo
_movie.preLoad({frameNameOrNum})
_movie.preLoad(fromFrameNameOrNum, toFrameNameOrNum)
_movie.preLoad({frameNameorNum});
_movie.preLoad(fromFrameNameOrNum, toFrameNameOrNum);
```

### Description
Movie method; preloads cast members in the specified frame or range of frames into memory
and stops when memory is full or when all of the specified cast members have been preloaded,
as follows:

• When used without arguments, this method preloads all cast members used from the current
frame to the last frame of a movie.
• When used with one argument, frameNameOrNum, this method preloads all cast members used
in the range of frames from the current frame to the frame frameNameOrNum, as specified by
the frame number or label name.
• When used with two arguments, fromFrameNameOrNum and toFrameNameOrNum, preloads all
cast members used in the range of frames from the frame fromFrameNameOrNum to the frame
toFrameNameOrNum, as specified by the frame number or label name.
The preLoad() method also returns the number of the last frame successfully loaded. To obtain
this value, use the result() method.

466

Chapter 12: Methods

### Parameters
frameNameOrNum Optional. A string that specifies the specific frame to preload, or an integer that
specifies the number of the specific frame to preload.
fromFrameNameOrNum Required if preloading a range of frames. A string that specifies the name
of the label of the first frame in the range of frames to preload, or an integer that specifies the
number of the first frame in the range of frames to preload.
toFrameNameOrNum Required if preloading a range of frames. A string that specifies the name of

the label of the last frame in the range of frames to preload, or an integer that specifies the number
of the last frame in the range of frames to preload.

### Example
```lingo
This statement preloads the cast members used from the current frame to the frame that has the
next marker:
-- Lingo syntax
_movie.preLoad(_movie.marker(1))
// JavaScript syntax
_movie.preLoad(_movie.marker(1));

This statement preloads the cast members used from frame 10 to frame 50:
-- Lingo syntax
_movie.preLoad(10, 50)
// JavaScript syntax
_movie.preLoad(10, 50);
```

### See also
Movie, result

### Implementation
- **File**: `apps/client/src/director/api/preLoad-Movie.js`
- **Test**: `apps/client/src/director/api/__tests__/preLoad-Movie.test.js`
- **Dependencies**: Various (depends on function)

