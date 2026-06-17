## exitLock

**Source**: `docs/drmx2004_scripting_ref.txt` lines 38414-38457

### Usage
```lingo
_movie.exitLock
_movie.exitLock;
```

### Description
Movie property; determines whether a user can quit to the Windows desktop or Macintosh
Finder from projectors (FALSE, default) or not (TRUE). Read/write.
The user can quit to the desktop by pressing Control+period (Windows) or Command+period
(Macintosh), Control+Q (Windows) or Command+Q (Macintosh), or Control+W (Windows)
or Command+W (Macintosh); the Escape key is also supported in Windows.

### Parameters
None.

### Example
```lingo
This statement sets the exitLock property to TRUE:
-- Lingo syntax
_movie.exitLock = TRUE
// JavaScript syntax
_movie.exitLock = true;

Assuming that exitLock is set to TRUE, nothing occurs automatically when the Control+period/
Q/W, Esc, or Command+period/Q/W keys are used. This handler checks keyboard input for keys
to exit and takes the user to a custom quit sequence:
-- Lingo syntax
on checkExit
if ((_key.commandDown) and (_key.key = "." or _key.key = "q") and \
(_movie.exitLock = TRUE)) then _movie.go("quit sequence")
end checkExit

exitLock

759

// JavaScript syntax
function checkExit() {
if ((_key.commandDown) && (_key.key == "." | _key.key == "q") &&
(_movie.exitLock == true)) {
_movie.go("quit sequence");
}
}
```

### See also
Movie

### Implementation
- **File**: `apps/client/src/director/core/movie-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: None (part of MovieRef class)

