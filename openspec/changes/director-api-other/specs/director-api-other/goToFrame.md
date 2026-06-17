## goToFrame()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 18132-18161

### Usage
```lingo
spriteObjRef.goToFrame(frameNameOrNum)
spriteObjRef.goToFrame(frameNameOrNum);
```

### Description
Command; plays a Flash movie sprite beginning at the frame identified by the frameNumber
parameter. You can identify the frame by either an integer indicating a frame number or by a
string indicating a label name. Using the goToFrame command has the same effect as setting a
Flash movie sprite’s frame property.

goToFrame()

351

### Parameters
None.

### Example
```lingo
The following handler branches to different points within a Flash movie in channel 5. It accepts a
parameter that indicates which frame to go to.
-- Lingo syntax
on Navigate(whereTo)
sprite(5).goToFrame(whereTo)
end
// JavaScript syntax
function Navigate(whereTo) {
sprite(5).goToFrame(whereTo);
}
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/goToFrame.js`
- **Test**: `apps/client/src/director/api/__tests__/goToFrame.test.js`
- **Dependencies**: Various (depends on function)

