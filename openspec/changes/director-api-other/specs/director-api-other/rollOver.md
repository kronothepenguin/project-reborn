## rollOver()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26435-26500

### Usage
```lingo
_movie.rollOver({intSpriteNum})
_movie.rollOver({intSpriteNum});
```

### Description
Movie method; indicates whether the pointer (cursor) is currently over the bounding rectangle of
a specified sprite (TRUE or 1) or not (FALSE or 0).
The rollOver() method is typically used in frame scripts and is useful for creating handlers that
perform an action when the user places the pointer over a specific sprite.
If the user continues to roll the mouse, the value of rollOver() can change while a script is
running a handler, and can result in unexpected behavior. You can make sure that a handler uses a
consistent rollover value by assigning rollOver() to a variable when the handler starts.
When the pointer is over an area of the Stage where a sprite previously appeared, rollOver() still
occurs and reports the sprite as still being there. Avoid this behavior by not performing rollovers
over these locations, or by moving the sprite above the menu bar before removing it.

### Parameters
intSpriteNum Optional. An integer that specifies the sprite number.

512

Chapter 12: Methods

### Example
```lingo
This statement changes the content of the field cast member Message to “This is the place.” when
the pointer is over sprite 6:
-- Lingo syntax
if (_movie.rollOver(6)) then
member("Message").text = "This is the place."
end if
// JavaScript syntax
if (_movie.rollOver(6)) {
member("Message").text = "This is the place.";
}

The following handler sends the playhead to different frames when the pointer is over certain
sprites on the Stage. It first assigns the rollOver value to a variable. This lets the handler use the
rollOver value that was in effect when the rollover started, regardless of whether the user
continues to move the mouse.
-- Lingo syntax
on exitFrame
currentSprite = _movie.rollOver()
case currentSprite of
1: _movie.go("Left")
2: _movie.go("Middle")
3: _movie.go("Right")
end case
end exitFrame
// JavaScript syntax
function exitFrame() {
var currentSprite = _movie.rollOver();
switch (currentSprite) {
case 1: _movie.go("Left");
break;
case 2: _movie.go("Middle");
break;
case 3: _movie.go("Right");
break;
}
}
```

### See also
Movie

### Implementation
- **File**: `apps/client/src/director/api/rollOver.js`
- **Test**: `apps/client/src/director/api/__tests__/rollOver.test.js`
- **Dependencies**: Various (depends on function)

