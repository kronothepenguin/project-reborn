## hold()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 18482-18520

### Usage
```lingo
spriteObjRef.hitTest(point)
spriteObjRef.hitTest(point);
```

### Description
Flash command; stops a Flash movie sprite that is playing in the current frame, but any audio
continues to play.

### Parameters
None.

### Example
```lingo
This frame script holds the Flash movie sprites playing in channels 5 through 10 while allowing
the audio for these channels to continue playing:
-- Lingo syntax
on enterFrame
repeat with i = 5 to 10
sprite(i).hold()
end repeat
end

358

Chapter 12: Methods

// JavaScript syntax
function enterFrame() {
var i = 5;
while (i < 11) {
sprite(i).hold();
i++;
}
}
```

### See also
playRate (QuickTime, AVI)

### Implementation
- **File**: `apps/client/src/director/api/hold.js`
- **Test**: `apps/client/src/director/api/__tests__/hold.test.js`
- **Dependencies**: Various (depends on function)

