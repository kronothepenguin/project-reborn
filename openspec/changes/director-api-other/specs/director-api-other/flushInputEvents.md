## flushInputEvents()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16447-16482

### Usage
```lingo
_player.flushInputEvents()
_player.flushInputEvents();
```

### Description
Player method; flushes any waiting mouse or keyboard events from the Director message queue.
Generally this is useful when script is in a tight loop and the author wants to make sure any
mouse clicks or keyboard presses don't get through.
This method operates at runtime only and has no effect during authoring.

### Parameters
None.

### Example
```lingo
This statement disables mouse and keyboard events while a repeat loop executes:
-- Lingo syntax
repeat with i = 1 to 10000
_player.flushInputEvents()
sprite(1).loc = sprite(1).loc + point(1, 1)
end repeat
// JavaScript syntax
for (var i = 1; i <= 10000; i++) {
_player.flushInputEvents();
sprite(1).loc = sprite(1).loc + point(1, 1);
}
```

### See also
on keyDown, on keyUp, on mouseDown (event handler), on mouseUp (event handler),
Player

318

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/flushInputEvents.js`
- **Test**: `apps/client/src/director/api/__tests__/flushInputEvents.test.js`
- **Dependencies**: Various (depends on function)

