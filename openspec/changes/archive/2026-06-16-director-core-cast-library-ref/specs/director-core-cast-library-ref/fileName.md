## fileName (Cast)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 38644-38704

### Usage
```lingo
castObjRef.fileName
castObjRef.fileName;
```

### Description
Cast library property; returns or sets the filename of a cast library. Read-only for internal cast
libraries, read/write for external cast libraries.
For external cast libraries, fileName returns the cast’s full pathname and filename.
For internal cast libraries, fileName returns a value depending on which internal cast library
is specified.

• If the first internal cast library is specified, fileName returns the name of the movie.
• If any other internal cast library is specified, fileName returns an empty string.
This property accepts URLs as references. However, to use a cast library from the Internet and
minimize download time, use the downloadNetThing() or preloadNetThing() methods to
download the cast’s file to a local disk, and then set fileName to the file on the disk.
If a movie sets the filename of an external cast, do no use the Duplicate cast members for Faster
Loading option in the Project Options dialog box.

764

Chapter 14: Properties

### Parameters
None.

### Example
```lingo
This statement displays the pathname and filename of the Buttons external cast in the
Message window:
-- Lingo syntax
trace(castLib("Buttons").fileName)
// JavaScript syntax
trace(castLib("Buttons").fileName);

This statement sets the filename of the Buttons external cast to Content.cst:
-- Lingo syntax
castLib("Buttons").fileName = _movie.path & "Content.cst"
// JavaScript syntax
castLib("Buttons").fileName = _movie.path + "Content.cst";

The movie then uses the external cast file Content.cst as the Buttons cast.
These statements download an external cast from a URL to the Director application folder and
then make that file the external cast named Cast of Thousands:
-- Lingo syntax
downloadNetThing("http://wwwcbDeMille.com/Thousands.cst", \
_player.applicationPath & "Thousands.cst")
castLib("Cast of Thousands").fileName = _player.applicationPath & \
"Thousands.cst"
// JavaScript syntax
downloadNetThing("http://wwwcbDeMille.com/Thousands.cst",
_player.applicationPath + "Thousands.cst");
castLib("Cast of Thousands").fileName = _player.applicationPath +
"Thousands.cst";
```

### See also
Cast Library, downloadNetThing, preloadNetThing()

fileName (Cast)

765

### Implementation
- **File**: `apps/client/src/director/core/cast-library-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/cast-library-ref.test.js`
- **Dependencies**: None (part of CastLibraryRef class)

