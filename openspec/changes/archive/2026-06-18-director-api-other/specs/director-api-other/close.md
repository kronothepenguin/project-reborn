## close()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13658-13700

### Usage
```lingo
windowObjRef.close()
windowObjRef.close();
```

### Description
Window method; closes a window.
Closing a window that is already closed has no effect.

266

Chapter 12: Methods

Be aware that closing a window does not stop the movie in the window nor clear it from memory.
This method simply closes the window in which the movie is playing. You can reopen it quickly
by using the open() (Window) method. This allows rapid access to windows that you want to
keep available.
If you want to completely dispose of a window and clear it from memory, use the forget()
method. Make sure that nothing refers to the movie in that window if you use the forget()
method, or you will generate errors when scripts try to communicate or interact with the
forgotten window.

### Parameters
None.

### Example
```lingo
This statement closes the window named Panel, which is in the subfolder MIAW Sources within
the current movie’s folder:
-- Lingo syntax
window(_movie.path & "MIAW Sources\Panel").close()
// JavaScript syntax
window(_movie.path + "MIAW Sources\\Panel").close();

This statement closes the window that is number 5 in windowList:
-- Lingo syntax
window(5).close()
// JavaScript syntax
window(5).close();
```

### See also
forget() (Window), open() (Window), Window

### Implementation
- **File**: `apps/client/src/director/api/close.js`
- **Test**: `apps/client/src/director/api/__tests__/close.test.js`
- **Dependencies**: Various (depends on function)

