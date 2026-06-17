## sound (Player)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 49655-49677

### Usage
```lingo
_player.sound[intSoundChannelNum]
_player.sound[intSoundChannelNum];
```

### Description
Player property; provides indexed access to a Sound Channel object by using a Player property.
Read-only.
The intSoundChannelNum argument is an integer that specifies the number of the sound channel
to access.
The functionality of this property is identical to the top level sound() method.

### Parameters
None.

### Example
```lingo
This statement sets the variable mySound to the sound in sound channel 3:
-- Lingo syntax
mySound = _player.sound[3]
// JavaScript syntax
var mySound = _player.sound[3];
```

### See also
Player, sound(), Sound Channel

### Implementation
- **File**: `apps/client/src/director/core/player-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/player-ref.test.js`
- **Dependencies**: None (part of PlayerRef class)

