## _player

**Source**: `docs/drmx2004_scripting_ref.txt` lines 31529-31554

### Usage
```lingo
_player
_player;
```

### Description
Top-level property; provides a reference to the Player object, which manages and executes all
movies, including movies in a window (MIAWs). Read-only.

### Parameters
None.

### Example
```lingo
This statement sets the variable objPlayer to the _player property:
-- Lingo syntax
objPlayer = _player
// JavaScript syntax
var objPlayer = _player;

This statement uses the _player property directly to access the value of the xtraList property:
-- Lingo syntax
theXtras = _player.xtraList
// JavaScript syntax
var theXtras = _player.xtraList;
```

### See also
Player

### Implementation
- **File**: `apps/client/src/director/core/player-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/player-ref.test.js`
- **Dependencies**: None (part of PlayerRef class)

