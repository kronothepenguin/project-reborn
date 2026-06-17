## xtra

**Source**: `docs/drmx2004_scripting_ref.txt` lines 54592-54616

### Usage
```lingo
_player.xtra[xtraNameOrNum]
_player.xtra[xtraNameOrNum];
```

### Description
Player property; provides indexed or named access to the Xtra extensions available to the Director
player. Read-only.
The xtraNameOrNum argument is either a string that specifies the name of the Xtra extension to
access or an integer that specifies the index position of the Xtra extension to access.
The functionality of this property is identical to the top level xtra() method.

### Parameters
None.

### Example
```lingo
This statement sets the variable myXtra to the Speech Xtra extension:
-- Lingo syntax
myXtra = _player.xtra["SpeechXtra"]
// JavaScript syntax
var myXtra = _player.xtra["SpeechXtra"];
```

### See also
Player, xtra()

xtra 1097

### Implementation
- **File**: `apps/client/src/director/core/player-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/player-ref.test.js`
- **Dependencies**: None (part of PlayerRef class)

