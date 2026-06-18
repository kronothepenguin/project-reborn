## pause() (Sound Channel)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 22970-22997

### Usage
```lingo
soundChannelObjRef.pause()
soundChannelObjRef.pause();
```

### Description
Sound Channel method; suspends playback of the current sound in a sound channel.
A subsequent play() method will resume playback.

### Parameters
None.

### Example
```lingo
This statement pauses playback of the sound cast member playing in sound channel 1:
-- Lingo syntax
sound(1).pause()
// JavaScript syntax
sound(1).pause();
```

### See also
breakLoop(), play() (Sound Channel), playNext() (Sound Channel), queue(),
rewind() (Sound Channel), Sound Channel, stop() (Sound Channel)

444

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/pause-Sound-Channel.js`
- **Test**: `apps/client/src/director/api/__tests__/pause-Sound-Channel.test.js`
- **Dependencies**: Various (depends on function)

