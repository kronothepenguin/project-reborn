## currentTime (Sprite)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 36271-36309

### Usage
```lingo
spriteObjRef.currentTime
spriteObjRef.currentTime;
```

### Description
Sprite and sound channel property; returns the current playing time, in milliseconds, for a sound
sprite, QuickTime digital video sprite, or any Xtra extension that supports cue points. For a
sound channel, returns the current playing time of the sound member currently playing in the
given sound channel.
This property can be tested, but can only be set for traditional sound cast members (WAV, AIFF,
SND). When this property is set, the range of allowable values is from zero to the duration of
the member.
Shockwave Audio (SWA) sounds can appear as sprites in sprite channels, but they play sound in a
sound channel. You should refer to SWA sound sprites by their sprite channel number rather than
by a sound channel number.

### Parameters
None.

### Example
```lingo
This statement displays the current time, in seconds, of the sound sprite in sprite channel 10.
-- Lingo syntax
member("time").text = string(sprite(10).currentTime/ 1000)
// JavaScript syntax
member("time").text = (sprite(10).currentTime / 1000).toString();

This statement causes the sound playing in sound channel 2 to skip to the point 2.7 seconds from
the beginning of the sound cast member:
-- Lingo syntax
sound(2).currentTime = 2700
// JavaScript syntax
sound(2).currentTime = 2700;
```

### See also
duration (Member)

currentTime (Sprite)

719

### Implementation
- **File**: `apps/client/src/director/core/sprite-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/sprite-ref.test.js`
- **Dependencies**: None (part of SpriteRef class)

