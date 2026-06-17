## breakLoop()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12658-12686

### Usage
```lingo
soundChannelObjRef.breakLoop()
soundChannelObjRef.breakLoop();
```

### Description
Sound Channel method; causes the currently looping sound in channel soundChannelObjRef to
stop looping and play through to its endTime.
If there is no current loop, this method has no effect.

### Parameters
None.

### Example
```lingo
This handler causes the background music looping in sound channel 2 to stop looping and play
through to its end:
-- Lingo syntax
on continueBackgroundMusic
sound(2).breakLoop()
end
// JavaScript syntax
function continueBackgroundMusic() {
sound(2).breakLoop();
}
```

### See also
endTime, Sound Channel

### Implementation
- **File**: `apps/client/src/director/api/breakLoop.js`
- **Test**: `apps/client/src/director/api/__tests__/breakLoop.test.js`
- **Dependencies**: Various (depends on function)

