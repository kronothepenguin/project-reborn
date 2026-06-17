## nothing

**Source**: `docs/drmx2004_scripting_ref.txt` lines 22238-22295

### Usage
```lingo

```

### Description
Command; does nothing. This command is useful for making the logic of an if...then
statement more obvious. A nested if...then...else statement that contains no explicit
command for the else clause may require else nothing, so that Lingo does not interpret the
else clause as part of the preceding if clause.

### Parameters
None.

### Example
```lingo
The nested if...then...else statement in this handler uses the nothing command to satisfy
the statement’s else clause:
-- Lingo syntax
on mouseDown
if the clickOn = 1 then
if sprite(1).moveableSprite = TRUE then
member("Notice").text = "Drag the ball"
else nothing
else member("Notice").text = "Click again"
end if
end
// JavaScript syntax
function mouseDown() {
if (_mouse.clickOn == 1) {
if (sprite(1).moveableSprite) {
member("Notice").text = "Drag the ball";
} else {
// do nothing
}
} else {
member("Notice").text = "Click again";
}
}

This handler instructs the movie to do nothing so long as the mouse button is being pressed:
-- Lingo syntax
on mouseDown
repeat while the stillDown
nothing
end repeat
end mouseDown
// JavaScript syntax
function mouseDown() {
do {
// do nothing
} while _mouse.stillDown;
}
```

### See also
if

430

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/nothing.js`
- **Test**: `apps/client/src/director/api/__tests__/nothing.test.js`
- **Dependencies**: Various (depends on function)

