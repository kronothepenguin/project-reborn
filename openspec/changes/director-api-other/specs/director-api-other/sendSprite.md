## sendSprite()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27068-27106

### Usage
```lingo
_movie.sendSprite(spriteNameOrNum, event {, args})
_movie.sendSprite(spriteNameOrNum, event {, args});
```

### Description
Movie method; sends a message to all scripts attached to a specified sprite.
Messages sent using sendSprite() are sent to each of the scripts attached to the sprite. The
messages then follow the regular message hierarchy: cast member script, frame script, and
movie script.
If the given sprite does not have an attached behavior containing the given handler,
sendSprite() returns FALSE.

### Parameters
spriteNameOrNum Required. A string or an integer that specifies the name or number of the
sprite that will receive the event.
event Required. A symbol or string that specifies the event to send to the specified sprite.
args Optional. An argument or arguments to send with the message.

### Example
```lingo
This handler sends the custom message bumpCounter and the argument 2 to sprite 1 when the
user clicks:
-- Lingo syntax
on mouseDown me
_movie.sendSprite(1, #bumpCounter, 2)
end
// JavaScript syntax
function mouseDown() {
_movie.sendSprite(1, "bumpCounter", 2);
}

sendSprite()

525
```

### See also
Movie

### Implementation
- **File**: `apps/client/src/director/api/sendSprite.js`
- **Test**: `apps/client/src/director/api/__tests__/sendSprite.test.js`
- **Dependencies**: Various (depends on function)

