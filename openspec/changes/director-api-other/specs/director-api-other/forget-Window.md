## forget() (Window)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16483-16511

### Usage
```lingo
windowObjRef.forget()
windowObjRef.forget();
```

### Description
Window method; instructs script to close a window and stop its playback when it’s no longer in
use and no other variables refer to it.
Calling forget() on a window also removes that window’s reference from the windowList.
When the forget() method is called, the window and the movie in a window (MIAW) disappear
without calling the stopMovie, closeWindow, or deactivateWindow handlers.
If there are many global references to the movie in a window, the window doesn’t respond to the
forget() method.

### Parameters
None.

### Example
```lingo
This statement instructs Lingo to delete the window Control Panel when the movie no longer
uses the window:
-- Lingo syntax
window("Control Panel").forget()
// JavaScript syntax
window("Control Panel").forget();
```

### See also
close(), open() (Window), Window, windowList

### Implementation
- **File**: `apps/client/src/director/api/forget-Window.js`
- **Test**: `apps/client/src/director/api/__tests__/forget-Window.test.js`
- **Dependencies**: Various (depends on function)

