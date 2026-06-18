## callFrame()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13032-13058

### Usage
```lingo
spriteObjRef.callFrame(flashFrameNameOrNum)
spriteObjRef.callFrame(flashFrameNameOrNum);
```

### Description
Command; used to call a series of actions that reside in a frame of a Flash movie sprite.
This command sends a message to the Flash ActionScript engine and triggers the actions to
execute in the Flash movie.

### Parameters
flashFrameNameOrNum Required. A string or number that specifies the name or number of the

frame to call.

### Example
```lingo
This Lingo executes the actions that are attached to frame 10 of the Flash movie in sprite 1:
-- Lingo syntax
sprite(1).callFrame(10)
// JavaScript syntax
sprite(1).callFrame(10);

callFrame()

253
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/callFrame.js`
- **Test**: `apps/client/src/director/api/__tests__/callFrame.test.js`
- **Dependencies**: Various (depends on function)

