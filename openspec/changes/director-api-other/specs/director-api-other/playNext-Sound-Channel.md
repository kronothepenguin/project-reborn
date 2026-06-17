## playNext() (Sound Channel)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23452-23481

### Usage
```lingo
soundChannelObjRef.playNext()
soundChannelObjRef.playNext();
```

### Description
Sound Channel method; immediately interrupts playback of the current sound playing in a
sound channel and begins playing the next queued sound.
If no more sounds are queued in the given channel, the sound simply stops playing.

### Parameters
None.

454

Chapter 12: Methods

### Example
```lingo
This statement plays the next queued sound in sound channel 2:
-- Lingo syntax
sound(2).playNext()
// JavaScript syntax
sound(2).playNext();
```

### See also
pause() (Sound Channel), play() (Sound Channel), Sound Channel,stop() (Sound
Channel)

### Implementation
- **File**: `apps/client/src/director/api/playNext-Sound-Channel.js`
- **Test**: `apps/client/src/director/api/__tests__/playNext-Sound-Channel.test.js`
- **Dependencies**: Various (depends on function)

