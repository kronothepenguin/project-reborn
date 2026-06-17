## xtraList (Player)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 54648-54683

### Usage
```lingo
_player.xtraList
_player.xtraList;
```

### Description
Player property; displays a linear property list of all available Xtra extensions and their file
versions. Read-only.
This property is useful when the functionality of a movie depends on a certain version of an Xtra
extension.

1098

Chapter 14: Properties

There are two possible properties that can appear in xtraList:

• #filename—Specifies the filename of the Xtra extension on the current platform. It is possible
to have a list without a #filename entry, such as when the Xtra extension exists only on one
platform.
• #version—Specifies the same version number that appears in the Properties dialog box
(Windows) or Info window (Macintosh) when the file is selected on the desktop. An Xtra
extension may not necessarily have a version number.

### Parameters
None.

### Example
```lingo
This statement displays in the Message window all Xtra extensions that are available to the
Director Player.
-- Lingo syntax
trace(_player.xtraList)
// JavaScript syntax
trace(_player.xtraList);
```

### See also
mediaXtraList, Player, scriptingXtraList, toolXtraList, transitionXtraList

### Implementation
- **File**: `apps/client/src/director/core/player-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/player-ref.test.js`
- **Dependencies**: None (part of PlayerRef class)

