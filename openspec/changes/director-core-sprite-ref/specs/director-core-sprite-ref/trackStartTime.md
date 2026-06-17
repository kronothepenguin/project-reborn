## trackStartTime (Sprite)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 52431-52452

### Usage
```lingo
spriteObjRef.trackStartTime(whichTrack)
spriteObjRef.trackStartTime(whichTrack);
```

### Description
Digital video sprite property; sets the starting time of a digital video movie in the specified sprite
channel. The value of trackStartTime is measured in ticks.
This property can be tested but not set.

### Parameters
None.

### Example
```lingo
In the Message window, the following statement reports when track 5 in sprite channel 10 starts
playing. The starting time is 120 ticks (2 seconds) into the track.
-- Lingo syntax
put(sprite(10).trackStartTime(5))
// JavaScript syntax
put(sprite(10).trackStartTime(5));
```

### See also
duration (Member), playRate (QuickTime, AVI), currentTime (QuickTime, AVI)

### Implementation
- **File**: `apps/client/src/director/core/sprite-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/sprite-ref.test.js`
- **Dependencies**: None (part of SpriteRef class)

