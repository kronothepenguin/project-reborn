## stop() (Flash)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28355-28386

### Usage
```lingo
spriteObjRef.stop()
spriteObjRef.stop();
```

### Description
Flash command; stops a Flash movie sprite that is playing in the current frame.

### Parameters
None.

### Example
```lingo
This frame script stops the Flash movie sprites playing in channels 5 through 10:
-- Lingo syntax
on enterFrame
repeat with i = 5 to 10
sprite(i).stop()
end repeat
end
// JavaScript syntax
function enterFrame() {
var i = 5;
while (i < 11) {
sprite(i).stop();
i++;
}
}
```

### See also
hold()

### Implementation
- **File**: `apps/client/src/director/api/stop-Flash.js`
- **Test**: `apps/client/src/director/api/__tests__/stop-Flash.test.js`
- **Dependencies**: Various (depends on function)

