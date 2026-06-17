## stop() (RealMedia, SWA, Windows Media)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28387-28418

### Usage
```lingo
windowsMediaObjRef.stop()
realMediaObjRef.stop()
windowsMediaObjRef.stop();
realMediaObjRef.stop();
```

### Description
Windows Media or RealMedia cast member or sprite method. Stops playback of a Windows
Media or RealMedia cast member or sprite.

### Parameters
None.

552

Chapter 12: Methods

### Example
```lingo
The following examples stop sprite 2 and the cast member Real from playing:
-- Lingo syntax
sprite(2).stop()
member("Real").stop()
// JavaScript syntax
sprite(2).stop();
member("Real").stop();
```

### See also
RealMedia, Windows Media

### Implementation
- **File**: `apps/client/src/director/api/stop-RealMedia,-SWA,-Windows-Media.js`
- **Test**: `apps/client/src/director/api/__tests__/stop-RealMedia,-SWA,-Windows-Media.test.js`
- **Dependencies**: Various (depends on function)

