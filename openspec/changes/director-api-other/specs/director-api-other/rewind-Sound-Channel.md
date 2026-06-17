## rewind() (Sound Channel)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26343-26372

### Usage
```lingo
soundChannelObjRef.rewind()
soundChannelObjRef.rewind();
```

### Description
Sound Channel method; interrupts the playback of the current sound in a sound channel and
restarts it at its startTime.
If the sound is paused, it remains paused, with the currentTime set to the startTime.

510

Chapter 12: Methods

### Parameters
None.

### Example
```lingo
This statement restarts playback of the sound cast member playing in sound channel 1 from
the beginning:
-- Lingo syntax
sound(1).rewind()
// JavaScript syntax
sound(1).rewind();
```

### See also
Sound Channel, startTime

### Implementation
- **File**: `apps/client/src/director/api/rewind-Sound-Channel.js`
- **Test**: `apps/client/src/director/api/__tests__/rewind-Sound-Channel.test.js`
- **Dependencies**: Various (depends on function)

