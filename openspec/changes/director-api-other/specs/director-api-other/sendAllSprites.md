## sendAllSprites()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26989-27035

### Usage
```lingo
_movie.sendAllSprites(stringEventMessage {, args})
_movie.sendAllSprites(stringEventMessage {, args});
```

### Description
Movie method; sends a designated message to all sprites, not just the sprite that was involved in
the event. As with any other message, the message is sent to every script attached to the sprite,
unless the stopEvent() method is used.

sendAllSprites()

523

For best results, send the message only to those sprites that will properly handle the message
through the sendSprite() method. No error will occur if the message is sent to all the sprites,
but performance may decrease. There may also be problems if different sprites have the
same handler in a behavior, so avoid conflicts by using unique names for messages that will
be broadcast.
After the message has been passed to all behaviors, the event follows the regular message
hierarchy: cast member script, frame script, then movie script.
When you use the sendAllSprites() method, be sure to do the following:

• Replace stringEventMessage with the message.
• Replace args with any arguments to be sent with the message.
If no sprite has an attached behavior containing the given handler, sendAllSprites()
returns FALSE.

### Parameters
stringEventMessage Required. A string that specifies the message to send to all sprites.
args Optional. An argument or arguments to send with the message.

### Example
```lingo
This handler sends the custom message allSpritesShouldBumpCounter and the argument 2 to
all sprites when the user clicks the mouse:
-- Lingo syntax
on mouseDown me
_movie.sendAllSprites(#allspritesShouldBumpCounter, 2)
end
// JavaScript syntax
function mouseDown() {
_movie.sendAllSprites("allspritesShouldBumpCounter", 2);
}
```

### See also
Movie, sendSprite(), stopEvent()

### Implementation
- **File**: `apps/client/src/director/api/sendAllSprites.js`
- **Test**: `apps/client/src/director/api/__tests__/sendAllSprites.test.js`
- **Dependencies**: Various (depends on function)

