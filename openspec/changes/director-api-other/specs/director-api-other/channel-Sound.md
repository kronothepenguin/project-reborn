## channel() (Sound)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13200-13221

### Usage
```lingo
_sound.channel(intChannelNum)
_sound.channel(intChannelNum);
```

### Description
Sound method; returns a reference to a specified sound channel.
The functionality of this method is identical to the top level sound() method.

### Parameters
intChannelNum Required. An integer that specifies the sound channel to reference.

### Example
```lingo
This statement sets the variable named myChannel to sound channel 2:
-- Lingo syntax
myChannel = _sound.channel(2)
// JavaScript syntax
var myChannel = _sound.channel(2);
```

### See also
Sound, sound(), Sound Channel

### Implementation
- **File**: `apps/client/src/director/api/channel-Sound.js`
- **Test**: `apps/client/src/director/api/__tests__/channel-Sound.test.js`
- **Dependencies**: Various (depends on function)

