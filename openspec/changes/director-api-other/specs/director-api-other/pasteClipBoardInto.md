## pasteClipBoardInto()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 22913-22947

### Usage
```lingo
memberObjRef.pasteClipBoardInto()
memberObjRef.pasteClipBoardInto();
```

### Description
Member method; pastes the contents of the Clipboard into a specified cast member, and erases
the existing cast member.
Any item that is in a format that Director can use as a cast member can be pasted.
When copying a string from another application, the string’s formatting is not retained.
This method provides a convenient way to copy objects from other movies and from other
applications into the Cast window. Because copied cast members must be stored in RAM, avoid
using this command during playback in low memory situations.
When using this method in Shockwave Player, or in the authoring environment and projectors
with the safePlayer property set to TRUE, a warning dialog will allow the user to cancel the
paste operation.

### Parameters
None.

### Example
```lingo
This statement pastes the Clipboard contents into the bitmap cast member Shrine:
-- Lingo syntax
member("shrine").pasteClipBoardInto()
// JavaScript syntax
member("shrine").pasteClipBoardInto();
```

### See also
Member, safePlayer

pasteClipBoardInto()

443

### Implementation
- **File**: `apps/client/src/director/api/pasteClipBoardInto.js`
- **Test**: `apps/client/src/director/api/__tests__/pasteClipBoardInto.test.js`
- **Dependencies**: Various (depends on function)

