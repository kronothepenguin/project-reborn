## windowPresent()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 30199-30229

### Usage
```lingo
_player.windowPresent(stringWindowName)
_player.windowPresent(stringWindowName);
```

### Description
Player method; indicates whether the object specified by stringWindowName is running as a
movie in a window (TRUE) or not (FALSE).
If a window had been opened, windowPresent() remains TRUE for the window until the window
has been removed from the windowList property.
The stringWindowName argument must be the window’s name as it appears in the windowList
property.

### Parameters
stringWindowName Required. A string that specifies the name of the window to test.

### Example
```lingo
This statement tests whether the object myWindow is a movie in a window (MIAW) and then
displays the result in the Message window:
-- Lingo syntax
put(_player.windowPresent(myWindow))
// JavaScript syntax
put(_player.windowPresent(myWindow));
```

### See also
Player, windowList

590

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/windowPresent.js`
- **Test**: `apps/client/src/director/api/__tests__/windowPresent.test.js`
- **Dependencies**: Various (depends on function)

