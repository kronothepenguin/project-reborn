## xtraList (Movie)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 54617-54647

### Usage
```lingo
_movie.xtraList
_movie.xtraList;
```

### Description
Movie property; displays a linear property list of all Xtra extensions in the Movies/Xtras dialog
box that have been added to the movie. Read-only.
Two possible properties can appear in xtraList:

• #filename—Specifies the filename of the Xtra extension on the current platform. It is possible
to have a list without a #filename entry, such as when the Xtra extension exists only on one
platform.
• #packageurl—Specifies the location, as a URL, of the download package specified by
#packagefiles.
• #packagefiles—Set only when the Xtra extension is marked for downloading. The value
of this property is another list containing a property list for each file in the download package
for the current platform. The properties in this subproperty list are #name and #version,
which contain the same information as found in xtraList (Player).

### Parameters
None.

### Example
```lingo
This statement displays the xtraList in the Message window:
-- Lingo syntax
put(_movie.xtraList)
// JavaScript syntax
put(_movie.xtraList);
```

### See also
Movie, xtraList (Player)

### Implementation
- **File**: `apps/client/src/director/core/movie-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: None (part of MovieRef class)

