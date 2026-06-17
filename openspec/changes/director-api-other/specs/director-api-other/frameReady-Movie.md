## frameReady() (Movie)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16591-16648

### Usage
```lingo
_movie.frameReady({intFrameNum})
_movie.frameReady(frameNumA, frameNumB)
_movie.frameReady({intFrameNum});
_movie.frameReady(frameNumA, frameNumB);
```

### Description
Movie method; for Director movies, projectors, and movies with Shockwave content, determines
whether the cast members of a frame or range of frames have been downloaded.
This method returns TRUE if the specified cast members have been downloaded, and FALSE if not.
For a demonstration of the frameReady() method used in a Director movie, see the sample
movie “Streaming Shockwave” in Director Help.

### Parameters
intFrameNum Optional if testing whether a single frame’s cast members have been downloaded.
An integer that specifies the individual frame to test. If omitted, frameReady() determines
whether the cast members used in any frame of a Score have been downloaded.
frameNumA Required if testing whether the cast members in a range of frames have been

downloaded. An integer that specifies the first frame in the range.
frameNumB Required if testing whether the cast members in a range of frames have been

downloaded. An integer that specifies the last frame in the range.

### Example
```lingo
This statement determines whether the cast members for frame 20 are downloaded and ready to
be viewed:
-- Lingo syntax
on exitFrame
if (_movie.frameReady(20)) then
_movie.go(20)
else
_movie.go(1)
end if
end
// JavaScript syntax
function exitFrame() {
if (_movie.frameReady(20)) {
_movie.go(20);
}
else {
_movie.go(1);
}
}

frameReady() (Movie)

321

The following frame script checks to see if frame 25 of a Flash movie sprite in channel 5 can be
rendered. If it can’t, the script keeps the playhead looping in the current frame of the Director
movie. When frame 25 can be rendered, the script starts the movie and lets the playhead proceed
to the next frame of the Director movie.
```

### See also
mediaReady, Movie

### Implementation
- **File**: `apps/client/src/director/api/frameReady-Movie.js`
- **Test**: `apps/client/src/director/api/__tests__/frameReady-Movie.test.js`
- **Dependencies**: Various (depends on function)

