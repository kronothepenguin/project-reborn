## openFile()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 22607-22625

### Usage
```lingo
fileioObjRef.openFile(stringFileName, intMode)
fileioObjRef.openFile(stringFileName, intMode)
```

### Description
Fileio method; Opens a specified file with a specified mode.

### Parameters
stringFileName Required. A string that specifies the full path and name of the file to open.
intMode Required. An integer that specifies the mode of the file. Valid values include:

• 0—Read/write
• 1—Read-only
• 2—Writeable

### Example
```lingo

```

### See also
Fileio

### Implementation
- **File**: `apps/client/src/director/api/openFile.js`
- **Test**: `apps/client/src/director/api/__tests__/openFile.test.js`
- **Dependencies**: Various (depends on function)

