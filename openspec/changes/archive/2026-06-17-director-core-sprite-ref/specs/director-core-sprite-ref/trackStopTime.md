## trackStopTime (Sprite)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 52474-52498

### Usage
```lingo
spriteObjRef.trackStopTime(whichTrack)
spriteObjRef.trackStopTime(whichTrack);
```

### Description
Digital video sprite property; returns the stop time of the specified track of the specified digital
video sprite.
When a digital video movie is played, trackStopTime is when playback halts or loops if the loop
property is turned on.
This property can be tested but not set.

### Parameters
None.

### Example
```lingo
This statement determines the stop time of track 5 in the digital video assigned to sprite 6 and
displays the result in the Message window:
-- Lingo syntax
put(sprite(6).trackStopTime(5))
// JavaScript syntax
put(sprite(6).trackStopTime(5));
```

### See also
playRate (QuickTime, AVI), currentTime (QuickTime, AVI), trackStartTime
(Member)

### Implementation
- **File**: `apps/client/src/director/core/sprite-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/sprite-ref.test.js`
- **Dependencies**: None (part of SpriteRef class)

