## debugPlaybackEnabled

**Source**: `docs/drmx2004_scripting_ref.txt` lines 36712-36741

### Usage
```lingo
_player.debugPlaybackEnabled
_player.debugPlaybackEnabled;
```

### Description
Player property; in Windows, opens a Message window for debugging purposes in Shockwave
and projectors. On the Macintosh, a log file is generated to allow put statements to output data
for debugging purposes. Read/write.
In Windows, this property does not have any effect when used in the Director application. Once
the Message window is closed, it cannot be reopened for a particular Shockwave Player or
projector session. If more than one movie with Shockwave content uses this script in a single
browser, only the first will open a Message window, and the Message window will be tied to the
first movie alone.
On the Macintosh, the generated log file is located in the Shockwave Player folder at HardDrive/
System Folder/Extensions/Macromedia/Shockwave.
To open this Message window, set the debugPlaybackEnabled property to TRUE. To close the
window, set the debugPlaybackEnabled property to FALSE.

### Parameters
None.

### Example
```lingo
This statement opens the Message window in either Shockwave Player or a projector:
-- Lingo syntax
_player.debugPlaybackEnabled = TRUE
// JavaScript syntax
_player.debugPlaybackEnabled = true;
```

### See also
Player, put()

### Implementation
- **File**: `apps/client/src/director/core/player-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/player-ref.test.js`
- **Dependencies**: None (part of PlayerRef class)

