## displaySave()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 15174-15189

### Usage
```lingo
fileioObjRef.displaySave(stringTitle, stringFileName)
fileioObjRef.displaySave(stringTitle, stringFileName);
```

### Description
Fileio method; Displays a Save dialog box.
This method returns to script the full path and name of the saved file.

### Parameters
stringTitle Required. A string that specifies the title displayed in the Save dialog box.
stringFileName Required. A string that specifies the full path and name of the file to save.

### Example
```lingo

```

### See also
Fileio

### Implementation
- **File**: `apps/client/src/director/api/displaySave.js`
- **Test**: `apps/client/src/director/api/__tests__/displaySave.test.js`
- **Dependencies**: Various (depends on function)

