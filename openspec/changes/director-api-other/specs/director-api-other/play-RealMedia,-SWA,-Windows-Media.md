## play() (RealMedia, SWA, Windows Media)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23349-23382

### Usage
```lingo
windowsMediaObjRef.play()
realMediaObjRef.play()
windowsMediaObjRef.play();
realMediaObjRef.play();
```

### Description
Windows Media or RealMedia cast member or sprite method; plays the Windows Media or
RealMedia cast member or plays the sprite on the Stage.
For cast members, only audio is rendered if present in the movie. If the cast member is already
playing, calling this method has no effect.

### Parameters
None.

### Example
```lingo
The following examples start the streaming process for the stream in sprite 2 and the cast
member Real.
-- Lingo syntax
sprite(2).play()
member("Real").play()
// JavaScript syntax
sprite(2).play();
member("Real").play();
```

### See also
RealMedia, Windows Media

452

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/play-RealMedia,-SWA,-Windows-Media.js`
- **Test**: `apps/client/src/director/api/__tests__/play-RealMedia,-SWA,-Windows-Media.test.js`
- **Dependencies**: Various (depends on function)

