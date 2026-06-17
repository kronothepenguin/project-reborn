## appMinimize()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12326-12352

### Usage
```lingo
_player.appMinimize()
_player.appMinimize();
```

### Description
Player method; in Microsoft Windows, causes a projector to minimize to the Windows Task Bar.
On the Macintosh, causes a projector to be hidden.
On the Macintosh, reopen a hidden projector from the Macintosh application menu.
This method is useful for projectors and MIAWs that play back without a title bar.

### Parameters
None.

### Example
```lingo
--Lingo syntax
on mouseUp me
_player.appMinimize()
end
// JavaScript syntax
function mouseUp() {
_player.appMinimize();
}
```

### See also
Player

### Implementation
- **File**: `apps/client/src/director/api/appMinimize.js`
- **Test**: `apps/client/src/director/api/__tests__/appMinimize.test.js`
- **Dependencies**: Various (depends on function)

