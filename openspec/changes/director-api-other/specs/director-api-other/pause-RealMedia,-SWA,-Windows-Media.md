## pause() (RealMedia, SWA, Windows Media)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23018-23052

### Usage
```lingo
memberOrSpriteObjRef.pause()
memberOrSpriteObjRef.pause();
```

### Description
RealMedia and Windows Media sprite or cast member method; pauses playback of the
media stream.
The mediaStatus value becomes #paused.
Calling this method while the RealMedia or Windows Media stream is playing does not change
the currentTime property and does not clear the media buffer; this allows subsequent play
commands to resume playback without rebuffering the stream.

### Parameters
None.

### Example
```lingo
The following examples pause the playing of sprite 2 or the cast member Real.
-- Lingo syntax
sprite(2).pause()
member("Real").pause()

pause() (RealMedia, SWA, Windows Media)

445

// JavaScript syntax
sprite(2).pause();
member("Real").pause();
```

### See also
mediaStatus (RealMedia, Windows Media), play() (RealMedia, SWA, Windows
Media), seek(), stop() (RealMedia, SWA, Windows Media)

### Implementation
- **File**: `apps/client/src/director/api/pause-RealMedia,-SWA,-Windows-Media.js`
- **Test**: `apps/client/src/director/api/__tests__/pause-RealMedia,-SWA,-Windows-Media.test.js`
- **Dependencies**: Various (depends on function)

