## setTrackEnabled()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27730-27762

### Usage
```lingo
spriteObjRef.setTrackEnabled(whichTrack, trueOrFalse)
spriteObjRef.setTrackEnabled(whichTrack, trueOrFalse);
```

### Description
Command; determines whether the specified track in the digital video is enabled to play.

• When setTrackEnabled is TRUE, the specified track is enabled and playing.
• When setTrackEnabled is FALSE, the specified track is disabled and muted. For video tracks,
this means they will no longer be updated on the screen.
To test whether a track is already enabled, test the trackEnabled sprite property.

### Parameters
whichTrack Required. Specifies the track to test.

538

Chapter 12: Methods

trueOrFalse Required. Specifies whether the track in the digital video is enabled (TRUE) or
not (FALSE).

### Example
```lingo
This statement enables track 3 of the digital video assigned to sprite channel 8:
-- Lingo syntax
sprite(8).setTrackEnabled(3, TRUE)
// JavaScript syntax
sprite(8).setTrackEnabled(3, 1);
```

### See also
trackEnabled

### Implementation
- **File**: `apps/client/src/director/api/setTrackEnabled.js`
- **Test**: `apps/client/src/director/api/__tests__/setTrackEnabled.test.js`
- **Dependencies**: Various (depends on function)

