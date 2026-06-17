## lastEvent()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19780-19801

### Usage
```lingo

```

### Description
Function; returns the time in ticks (1 tick = 1/60 of a second) since the last mouse click, rollover,
or key press occurred.

### Parameters
None.

### Example
```lingo
This statement checks whether 10 seconds have passed since the last mouse click, rollover, or key
press and, if so, sends the playhead to the marker Help:
if the lastEvent > 10 * 60 then go to "Help"
```

### See also
lastClick(), lastKey, lastRoll, milliseconds

380

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/lastEvent.js`
- **Test**: `apps/client/src/director/api/__tests__/lastEvent.test.js`
- **Dependencies**: Various (depends on function)

