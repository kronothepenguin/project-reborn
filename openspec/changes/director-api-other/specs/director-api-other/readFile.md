## readFile()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25462-25483

### Usage
```lingo
fileioObjRef.readFile()
fileioObjRef.readFile();
```

### Description
Fileio method; Reads from the current position to the end of a specified file, and returns the result
as a string.
You must first open a file by calling openFile() before using readFile() to read a file.

### Parameters
None.

492

Chapter 12: Methods

### Example
```lingo

```

### See also
Fileio, openFile()

### Implementation
- **File**: `apps/client/src/director/api/readFile.js`
- **Test**: `apps/client/src/director/api/__tests__/readFile.test.js`
- **Dependencies**: Various (depends on function)

