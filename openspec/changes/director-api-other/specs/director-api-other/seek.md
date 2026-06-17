## seek()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26844-26891

### Usage
```lingo
memberOrSpriteObjRef.seek(milliseconds)
memberOrSpriteObjRef.seek(milliseconds);
```

### Description
RealMedia sprite or cast member method; changes the media stream’s playback location to the
location specified by the number of milliseconds from the beginning of the stream. The
mediaStatus value usually becomes #seeking and then #buffering.
You can use this method to initiate play at points other than the beginning of the RealMedia
stream, or to jump forward or backward in the stream. The integer specified in milliseconds is
the number of milliseconds from the beginning of the stream; thus, to jump backward, you
would specify a lower number of milliseconds, not a negative number.

520

Chapter 12: Methods

If the seek command is called when mediaStatus is #paused, the stream rebuffers and returns to
#paused at the new location specified by seek. If seek is called when mediaStatus is #playing,
the stream rebuffers and automatically begins playing at the new location in the stream. If seek is
called when mediaStatus is #closed, nothing happens.
If you attempt to seek beyond the stream’s duration value, the integer argument you specify is
clipped to the range from 0 to the duration of the stream. You cannot jump ahead into a
RealMedia sprite that is streaming live content.
The statement x.seek(n) is the same as x.currentTime = n, and either of these calls will cause
the stream to be rebuffered.

### Parameters
milliseconds Required. An integer that specifies the number of milliseconds from the beggining

of the stream.

### Example
```lingo
The following examples set the current playback position of the stream to 10,000 milliseconds
(10 seconds):
-- Lingo syntax
sprite(2).seek(10000)
member("Real").seek(10000)
// JavaScript syntax
sprite(2).seek(10000);
member("Real").seek(10000);
```

### See also
duration (RealMedia, SWA), currentTime (RealMedia), play() (RealMedia, SWA,
Windows Media), pause() (RealMedia, SWA, Windows Media), stop() (RealMedia,
SWA, Windows Media), mediaStatus (RealMedia, Windows Media)

### Implementation
- **File**: `apps/client/src/director/api/seek.js`
- **Test**: `apps/client/src/director/api/__tests__/seek.test.js`
- **Dependencies**: Various (depends on function)

