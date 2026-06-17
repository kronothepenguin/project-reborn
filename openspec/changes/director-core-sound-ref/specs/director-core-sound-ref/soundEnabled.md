## soundEnabled

**Source**: `docs/drmx2004_scripting_ref.txt` lines 49813-49838

### Usage
```lingo
_sound.soundEnabled
_sound.soundEnabled;
```

### Description
Sound property; determines whether the sound is on (TRUE, default) or off (FALSE). Read/write.
When you set this property to FALSE, the sound is turned off, but the volume setting is
not changed.

### Parameters
None.

### Example
```lingo
This statement sets soundEnabled to the opposite of its current setting; it turns the sound on if it
is off and turns it off if it is on:
-- Lingo syntax
_sound.soundEnabled = not(_sound.soundEnabled)
// JavaScript syntax
_sound.soundEnabled = !(_sound.soundEnabled);
```

### See also
Sound

998

Chapter 14: Properties

### Implementation
- **File**: `apps/client/src/director/core/sound-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/sound-ref.test.js`
- **Dependencies**: None (part of SoundRef class)

