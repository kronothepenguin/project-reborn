## closeXlib

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13720-13749

### Usage
```lingo

```

### Description
Command; closes an Xlibrary file.
Xtra extensions are stored in Xlibrary files. Xlibrary files are resource files that contain Xtra
extensions. HyperCard XCMDs and XFCNs can also be stored in Xlibrary files.
The closeXlib command doesn’t work for URLs.
In Windows, using the DLL extension for Xtra extensions is optional.
It is good practice to close any file you have opened as soon as you have finished using it.
Note: This command is not supported in Shockwave Player.

### Parameters
whichFile Optional. Specifies the Xlibrary file to close. If whichFile is in a folder other than
that for the current movie, whichFile must specify a pathname. If whichFile is omitted, all
open Xlibraries are closed.

### Example
```lingo
This statement closes all open Xlibrary files:
closeXlib

This statement closes the Xlibrary Video Disc Xlibrary when it is in the same folder as the movie:
closeXlib "Video Disc Xlibrary"

The following statement closes the Xlibrary Transporter Xtra extensions in the folder New Xtras,
which is in the same folder as the movie. The disk is identified by the variable currentDrive:
closeXlib "@:New Xtras:Transporter Xtras"
```

### See also
interface(), openXlib

### Implementation
- **File**: `apps/client/src/director/api/closeXlib.js`
- **Test**: `apps/client/src/director/api/__tests__/closeXlib.test.js`
- **Dependencies**: Various (depends on function)

