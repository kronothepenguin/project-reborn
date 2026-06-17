## delay()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 14739-14798

### Usage
```lingo
_movie.delay(intTicks)
_movie.delay(intTicks);
```

### Description
Movie method; pauses the playhead for a given amount of time.

284

Chapter 12: Methods

The only mouse and keyboard activity possible during this time is stopping the movie by pressing
Control+Alt+period (Windows) or Command+period (Macintosh). Because it increases the time
of individual frames, delay() is useful for controlling the playback rate of a sequence of frames.
The delay() method can be applied only when the playhead is moving. However, when delay()
is in effect, handlers still run; only the playhead halts, not script execution. Place scripts that use
delay() in either an enterFrame or exitFrame handler.
To mimic the behavior of a halt in a handler when the playhead is not moving, use the
milliseconds property of the System object and wait for the specified amount of time to pass

before exiting the frame.

### Parameters
intTicks Required. An integer that specifies the number of ticks to pause the playhead. Each

tick is 1/60 of a second.

### Example
```lingo
This handler delays the movie for 2 seconds when the playhead exits the current frame:
-- Lingo syntax
on keyDown
_movie.delay(2*60)
end
// JavaScript syntax
function keyDown() {
_movie.delay(2*60);
}

This handler, which can be placed in a frame script, delays the movie a random number of ticks:
-- Lingo syntax
on keyDown
if (_key.key = "x") then
_movie.delay(random(180))
end if
end
// JavaScript syntax
function keyDown() {
if (_key.key == "x") {
_movie.delay(random(180));
}
}
```

### See also
endFrame, milliseconds, Movie

delay()

285

### Implementation
- **File**: `apps/client/src/director/api/delay.js`
- **Test**: `apps/client/src/director/api/__tests__/delay.test.js`
- **Dependencies**: Various (depends on function)

