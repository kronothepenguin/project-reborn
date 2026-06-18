## isBusy()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19500-19540

### Usage
```lingo
soundChannelObjRef.isBusy()
soundChannelObjRef.isBusy();
```

### Description
Sound Channel method; determines whether a sound is playing (TRUE) or not playing (FALSE) in
a sound channel.
Make sure that the playhead has moved before using isBusy() to check the sound channel. If
this function continues to return FALSE after a sound should be playing, add the updateStage()
method to start playing the sound before the playhead moves again.
This method works for those sound channels occupied by actual audio cast members.
QuickTime, Flash, and Shockwave Player audio handle sound differently, and this method will
not work with those media types.
Consider using the status property of a sound channel instead of isBusy(). The status
property can be more accurate under many circumstances.

### Parameters
None.

374

Chapter 12: Methods

### Example
```lingo
The following statement checks whether a sound is playing in sound channel 1 and loops in the
frame if it is. This allows the sound to finish before the playhead goes to another frame.
-- Lingo syntax
if (sound(1).isBusy()) then
_movie.go(_movie.frame)
end if
// JavaScript syntax
if (sound(1).isBusy()) {
_movie.go(_movie.frame);
}
```

### See also
status, Sound Channel

### Implementation
- **File**: `apps/client/src/director/api/isBusy.js`
- **Test**: `apps/client/src/director/api/__tests__/isBusy.test.js`
- **Dependencies**: Various (depends on function)

