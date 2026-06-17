## copyToClipBoard()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 14004-14037

### Usage
```lingo
memberObjRef.copyToClipBoard()
memberObjRef.copyToClipBoard();
```

### Description
Member method; copies a specified cast member to the Clipboard.
Calling this method does not require the Cast window to be active.
This method is useful when copying cast members between movies or applications.

### Parameters
None.

### Example
```lingo
This statement copies the cast member named chair to the Clipboard:
-- Lingo syntax
member("chair").copyToClipBoard()
// JavaScript syntax
member("chair").copyToClipBoard();

This statement copies cast member number 5 to the Clipboard:
-- Lingo syntax
member(5).copyToClipBoard()
// JavaScript syntax
member(5).copyToClipBoard();
```

### See also
Member, pasteClipBoardInto()

copyToClipBoard()

273

### Implementation
- **File**: `apps/client/src/director/api/copyToClipBoard.js`
- **Test**: `apps/client/src/director/api/__tests__/copyToClipBoard.test.js`
- **Dependencies**: Various (depends on function)

