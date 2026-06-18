## window()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 30169-30198

### Usage
```lingo
window(stringWindowName)
window(stringWindowName);
```

### Description
Top level function; returns a reference to a specified window.
The specified window must contain a Director movie.
Windows that play movies are useful for creating floating palettes, separate control panels, and
windows of different shapes. Using windows that play movies, you can have several movies open
at once and allow them to interact.

### Parameters
stringWindowName Required. A string that specifies the name of the window to reference.

window()

589

### Example
```lingo
This statement sets the variable myWindow to the window named Collections:
-- Lingo syntax
myWindow = window("Collections")
// JavaScript syntax
var myWindow = window("Collections");
```

### See also
Window

### Implementation
- **File**: `apps/client/src/director/api/window.js`
- **Test**: `apps/client/src/director/api/__tests__/window.test.js`
- **Dependencies**: Various (depends on function)

