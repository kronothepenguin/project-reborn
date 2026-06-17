## openXlib

**Source**: `docs/drmx2004_scripting_ref.txt` lines 22626-22658

### Usage
```lingo

```

### Description
Command; opens a specified Xlibrary file.
It is good practice to close any file you have opened as soon as you are finished using it. The
openXlib command has no effect on an open file.
The openXlib command doesn’t support URLs as file references.
Xlibrary files contain Xtra extensions. Unlike openResFile, openXlib makes these Xtra
extensions known to Director.
When you open a Scripting Xtra extension using openXlib, you must use closeXlib to close it
when Director is finished using it.

openXlib

437

In Windows, the .dll extension is optional.
Note: This command is not supported in Shockwave Player.

### Parameters
whichFile Required. Specifies the Xlibrary file to open. If the file is not in the folder containing
the current movie, whichFile must include the pathname.

### Example
```lingo
This statement opens the Xlibrary file Video Disc Xlibrary:
openXlib "Video Disc Xlibrary"

This statement opens the Xlibrary file Xtras, which is in a different folder than the current movie:
openXlib "My Drive:New Stuff:Transporter Xtras"
```

### See also
closeXlib, interface()

### Implementation
- **File**: `apps/client/src/director/api/openXlib.js`
- **Test**: `apps/client/src/director/api/__tests__/openXlib.test.js`
- **Dependencies**: Various (depends on function)

