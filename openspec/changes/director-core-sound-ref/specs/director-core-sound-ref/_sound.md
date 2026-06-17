## _sound

**Source**: `docs/drmx2004_scripting_ref.txt` lines 31555-31584

### Usage
```lingo
_sound
_sound;
```

### Description
Top-level property; provides a reference to the Sound object, which controls audio playback in all
eight available sound channels. Read-only.

### Parameters
None.

### Example
```lingo
This statement sets the variable objSound to the _sound property:
-- Lingo syntax
objSound = _sound
// JavaScript syntax
var objSound = _sound;

620

Chapter 14: Properties

This statement uses the _sound property directly to access the soundLevel property:
-- Lingo syntax
theLevel = _sound.soundLevel
// JavaScript syntax
var theLevel = _sound.soundLevel;
```

### See also
Sound

### Implementation
- **File**: `apps/client/src/director/core/sound-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/sound-ref.test.js`
- **Dependencies**: None (part of SoundRef class)

