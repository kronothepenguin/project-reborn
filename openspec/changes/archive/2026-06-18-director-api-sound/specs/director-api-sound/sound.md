## sound()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28010-28038

### Usage
```lingo
sound(intSoundChannel)
sound(intSoundChannel);
```

### Description
Top level function; returns a reference to a specified sound channel.
The functionality of this method is identical to the Sound object’s channel() method.

### Parameters
intSoundChannel Required. An integer that specifies the sound channel to reference.

### Example
```lingo
The following example assigns sound channel 1 to a variable music and plays a sound.
-- Lingo syntax
music = sound(1)
music.play(member("waltz1"))
// JavaScript syntax
var music = sound(1);
music.play(member("waltz1"));

544

Chapter 12: Methods
```

### See also
channel() (Sound), Sound Channel

### Implementation
- **File**: `apps/client/src/director/api/sound.js`
- **Test**: `apps/client/src/director/api/__tests__/sound.test.js`
- **Dependencies**: director-core-sound-ref

