## playFromToTime()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23426-23451

### Usage
```lingo
windowsMediaObjRef.playFromToTime(intStartTime, intEndTime)
windowsMediaObjRef.playFromToTime(intStartTime, intEndTime);
```

### Description
Windows Media sprite method. Starts playback from a specified start time and plays to a specified
end time.

### Parameters
intStartTime Required. An integer that specifies the time, in milliseconds, at which playback

begins.
intEndTime Required. An integer that specifies the time, in milliseconds, at which playback ends.

### Example
```lingo
This statement specifies that the sprite named Video should play from the 30 second mark to the
40 second mark.
-- Lingo syntax
sprite("Video").playFromToTime(30000, 40000)
// JavaScript syntax
sprite("Video").playFromToTime(30000, 40000);
```

### See also
Windows Media

### Implementation
- **File**: `apps/client/src/director/api/playFromToTime.js`
- **Test**: `apps/client/src/director/api/__tests__/playFromToTime.test.js`
- **Dependencies**: Various (depends on function)

