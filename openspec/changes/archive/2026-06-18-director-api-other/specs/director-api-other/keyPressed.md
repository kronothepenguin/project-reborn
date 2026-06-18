## keyPressed()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19636-19699

### Usage
```lingo
_key.keyPressed({keyCodeOrCharacter})
_key.keyPressed({keyCodeOrCharacter});
```

### Description
Key method; returns the character string assigned to the key that was last pressed, or optionally
whether a specified key was pressed.
If the keyCodeOrCharacter parameter is omitted, this method returns the character string
assigned to the last key that was pressed. If no key was pressed, this method returns an
empty string.
If the keyCodeOrCharacter is used to specify the key being pressed, this method returns TRUE if
that particular key is being pressed, or FALSE if not.
This method is updated when the user presses keys while in a repeat (Lingo) or for (JavaScript
syntax) loop. This is an advantage over the key property, which doesn’t update while in a repeat
or for loop.
To test which characters correspond to different keys on different keyboards, use the Keyboard
Lingo sample movie.

### Parameters
keyCodeOrCharacter Optional. The key code or ASCII character string to test.

keyPressed()

377

### Example
```lingo
The following statement checks whether the user pressed the Enter key in Windows or the Return
key on a Macintosh and runs the handler updateData if the key was pressed:
-- Lingo syntax
if (_key.keyPressed(RETURN)) then
updateData
end if
// JavaScript syntax
if (_key.keyPressed(36)) {
updateData();
}

This statement uses the keyCode for the a key to test if it’s down and displays the result in the
Message window:
-- Lingo syntax
if (_key.keyPressed(0)) then
put("The key is down")
end if
// JavaScript syntax
if (_key.keyPressed(0)) {
put("The key is down");
}

This statement uses the ASCII strings to test if the a and b keys are down and displays the result
in the Message window:
-- Lingo syntax
if (_key.keyPressed("a") and _key.keyPressed("b")) then
put("Both keys are down")
end if
// JavaScript syntax
if (_key.keyPressed("a") && _key.keyPressed("b")) {
put("Both keys are down");
}
```

### See also
Key, key, keyCode

### Implementation
- **File**: `apps/client/src/director/api/keyPressed.js`
- **Test**: `apps/client/src/director/api/__tests__/keyPressed.test.js`
- **Dependencies**: Various (depends on function)

