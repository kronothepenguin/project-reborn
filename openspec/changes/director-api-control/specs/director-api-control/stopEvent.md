## stopEvent()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28419-28470

### Usage
```lingo
_movie.stopEvent()
_movie.stopEvent();
```

### Description
Movie method; prevents scripts from passing an event message to subsequent locations in the
message hierarchy.
This method also applies to sprite scripts.
Use the stopEvent() method to stop the message in a primary event handler or a sprite script,
thus making the message unavailable for subsequent sprite scripts.
By default, messages are available first to a primary event handler (if one exists) and then to any
scripts attached to a sprite involved in the event. If more than one script is attached to the sprite,
the message is available to each of the sprite’s scripts. If no sprite script responds to the message,
the message passes to a cast member script, frame script, and movie script, in that order.
The stopEvent() method applies only to the current event being handled. It does not affect
future events. The stopEvent() method applies only within primary event handlers, handlers
that primary event handlers call, or multiple sprite scripts. It has no effect elsewhere.

### Parameters
None.

### Example
```lingo
This statement shows the mouseUp event being stopped in a behavior if the global variable
grandTotal is equal to 500:
-- Lingo syntax
global grandTotal
on mouseUp me
if (grandTotal = 500) then
_movie.stopEvent()
end if
end

stopEvent()

553

// JavaScript syntax
_global.grandTotal;
function mouseUp() {
if (_global.grandTotal == 500) {
_movie.stopEvent();
}
}

Neither subsequent scripts nor other behaviors on the sprite receive the event if it is stopped in
this manner.
```

### See also
Movie

### Implementation
- **File**: `apps/client/src/director/api/stopEvent.js`
- **Test**: `apps/client/src/director/api/__tests__/stopEvent.test.js`
- **Dependencies**: director-core-movie-ref

