## stop() (Sound Channel)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28324-28354

### Usage
```lingo
soundChannelObjRef.stop()
soundChannelObjRef.stop();
```

### Description
Sound Channel method; stops the currently playing sound in a sound channel.
Issuing a play() method begins playing the first sound of those that remain in the queue of the
given sound channel.
To see an example of stop() used in a completed movie, see the Sound Control movie in the
Learning/Lingo folder inside the Director application folder.

### Parameters
None.

### Example
```lingo
This statement stops playback of the sound cast member currently playing in sound channel 1:
-- Lingo syntax
sound(1).stop()
// JavaScript syntax
sound(1).stop();
```

### See also
getPlayList(), pause() (Sound Channel), play() (Sound Channel), playNext()
(Sound Channel), rewind() (Sound Channel), Sound Channel

stop() (Sound Channel)

551

### Implementation
- **File**: `apps/client/src/director/api/stop-Sound-Channel.js`
- **Test**: `apps/client/src/director/api/__tests__/stop-Sound-Channel.test.js`
- **Dependencies**: Various (depends on function)

