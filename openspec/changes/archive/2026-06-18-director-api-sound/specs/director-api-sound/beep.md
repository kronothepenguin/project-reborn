## beep()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12396-12430

### Usage
```lingo
_sound.beep({intBeepCount})
_sound.beep({intBeepCount});
```

### Description
Sound method; causes the computer’s speaker to beep the number of times specified by
intBeepCount. If intBeepCount is missing, the beep occurs once.

• In Windows, the beep is the sound assigned in the Sounds Properties dialog box.
• For the Macintosh, the beep is the sound selected from Alert Sounds on the Sound control
panel. If the volume on the Sound control panel is set to 0, the menu bar flashes instead.

### Parameters
intBeepCount Optional. An integer that specifies the number of times the computer’s speakers

should beep.

### Example
```lingo
-- Lingo syntax
on mouseUp me
_sound.beep(1)
end mouseUp

beep()

241

// JavaScript syntax
function mouseUp() {
_sound.beep(1);
}
```

### See also
Sound

### Implementation
- **File**: `apps/client/src/director/api/beep.js`
- **Test**: `apps/client/src/director/api/__tests__/beep.test.js`
- **Dependencies**: director-core-sound-ref

