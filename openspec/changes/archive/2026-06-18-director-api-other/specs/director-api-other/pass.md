## pass

**Source**: `docs/drmx2004_scripting_ref.txt` lines 22867-22912

### Usage
```lingo

```

### Description
Command; passes an event message to the next location in the message hierarchy and enables
execution of more than one handler for a given event.
The pass command branches to the next location as soon as the command runs. Any Lingo that
follows the pass command in the handler does not run.
By default, an event message stops at the first location containing a handler for the event, usually
at the sprite level.
If you include the pass command in a handler, the event is passed to other objects in the
hierarchy even though the handler would otherwise intercept the event.

### Parameters
None.

### Example
```lingo
This handler checks the key presses being entered, and allows them to pass through to the editable
text sprite if they are valid characters:
-- Lingo syntax
on keyDown me
legalCharacters = "1234567890"
if legalCharacters contains the key then
pass
else
beep
end if

442

Chapter 12: Methods

end
// JavaScript syntax
function keyDown() {
legalCharacters = "1234567890";
if (legalCharacters.indexOf(_key.key) >= 0) {
pass();
} else {
_sound.beep();
}
}
```

### See also
stopEvent()

### Implementation
- **File**: `apps/client/src/director/api/pass.js`
- **Test**: `apps/client/src/director/api/__tests__/pass.test.js`
- **Dependencies**: Various (depends on function)

