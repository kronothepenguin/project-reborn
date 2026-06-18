## quit()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25227-25258

### Usage
```lingo
_player.quit()
_player.quit();
```

### Description
Player method; exits from Director or a projector to the Windows desktop or Macintosh Finder.

quit()

487

### Parameters
None.

### Example
```lingo
This statement tells the computer to exit to the Windows desktop or Macintosh Finder when the
user presses Control+Q in Windows or Command+Q on the Macintosh:
-- Lingo syntax
if (_key.key = "q" and _key.commandDown) then
_player.quit()
end if
// JavaScript syntax
if (_key.key == "q" && _key.commandDown) {
_player.quit();
}
```

### See also
Player

### Implementation
- **File**: `apps/client/src/director/api/quit.js`
- **Test**: `apps/client/src/director/api/__tests__/quit.test.js`
- **Dependencies**: director-core-movie-ref

