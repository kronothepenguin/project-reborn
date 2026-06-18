## open() (Player)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 22530-22565

### Usage
```lingo
_player.open({stringDocPath,} stringAppPath)
_player.open({stringDocPath,} stringAppPath);
```

### Description
Player method; opens a specified application, and optionally opens a specified file when the
applicatin opens.
When either stringDocPath or stringAppPath are in a different folder than the current movie,
you must specify the full pathname to the file or files.
The computer must have enough memory to run both Director and other applications at the
same time.
This is a very simple method for opening an application or a document within an application. For
more control, look at options available in third-party Xtra extensions.

open() (Player)

435

### Parameters
stringDocPath Optional. A string that specifies the document to open when the application
specified by stringAppPath opens.
stringAppPath Required. A string that specifies the path to the application to open.

### Example
```lingo
This statement opens the TextEdit application, which is in the folder Applications on the drive
HD (Macintosh), and the document named Storyboards:
-- Lingo syntax
_player.open("Storyboards", "HD:Applications:TextEdit")
// JavaScript syntax
_player.open("Storyboards", "HD:Applications:TextEdit");
```

### See also
Player

### Implementation
- **File**: `apps/client/src/director/api/open-Player.js`
- **Test**: `apps/client/src/director/api/__tests__/open-Player.test.js`
- **Dependencies**: Various (depends on function)

