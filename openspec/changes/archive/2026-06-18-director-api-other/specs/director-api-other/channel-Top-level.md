## channel() (Top level)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13173-13199

### Usage
```lingo
channel(soundChannelNameOrNum)
channel(soundChannelNameOrNum);
```

### Description
Top level function; returns a reference to a Sound Channel object.

### Parameters
soundChannelNameOrNum Required. A string that specifies the name of a sound channel, or an

integer that specifies the index position of a sound channel.

### Example
```lingo
This statement sets the variable newChannel to sound channel 9:
-- Lingo syntax
newChannel = channel(9)
// JavaScript syntax
var newChannel = channel(9);
```

### See also
Sound Channel

256

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/channel-Top-level.js`
- **Test**: `apps/client/src/director/api/__tests__/channel-Top-level.test.js`
- **Dependencies**: Various (depends on function)

