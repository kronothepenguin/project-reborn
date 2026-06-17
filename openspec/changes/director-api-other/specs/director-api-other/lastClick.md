## lastClick()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19761-19779

### Usage
```lingo

```

### Description
Function; returns the time in ticks (1 tick = 1/60 of a second) since the mouse button was
last pressed.
This function can be tested but not set.

### Parameters
None.

### Example
```lingo
This statement checks whether 10 seconds have passed since the last mouse click and, if so, sends
the playhead to the marker No Click:
if the lastClick > 10 * 60 then go to "No Click"
```

### See also
lastEvent(), lastKey, lastRoll, milliseconds

### Implementation
- **File**: `apps/client/src/director/api/lastClick.js`
- **Test**: `apps/client/src/director/api/__tests__/lastClick.test.js`
- **Dependencies**: Various (depends on function)

