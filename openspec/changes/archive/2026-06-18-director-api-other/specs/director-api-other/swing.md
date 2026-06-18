## swing()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28661-28700

### Usage
```lingo
spriteObjRef.swing(pan, tilt, fieldOfView, speedToSwing)
spriteObjRef.swing(pan, tilt, fieldOfView, speedToSwing);
```

### Description
QuickTime VR sprite function; swings a QuickTime 3 sprite containing a VR Pano around to
the new view settings. The swing is a smooth “camera dolly” effect.
whichQTVRSprite is the sprite number of the sprite with the QuickTime VR member.

The function returns immediately, but the sprite continues to change view until it reaches
the final view. The duration required to change to the final settings varies depending on
machine type, size of the sprite rectangle, color depth of the screen, and other typical
performance constraints.
To check if the swing has finished, check if the pan property of the sprite has arrived at the
final value.

### Parameters
pan Required. Specifies the new pan position, in degrees.
tilt Required. Specifies the new tilt, in degrees.
fieldOfView Required. Specifies the new field of view, in degrees.
speedToSwing Required. Specifies the rate at which the swing should take place. Valid values

range from 1 (slow) to 10 (fast).

### Example
```lingo
This very gradually adjusts the view of QTVR sprite 1 to a pan position of 300°, a tilt of -15°, and
a field of view of 40°:
-- Lingo syntax
sprite(1).swing(300, -15, 40, 1)
// JavaScript syntax
sprite(1).swing(300, -15, 40, 1);
```

### See also
pan (QTVR property)

558

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/swing.js`
- **Test**: `apps/client/src/director/api/__tests__/swing.test.js`
- **Dependencies**: Various (depends on function)

