## readLine()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25484-25500

### Usage
```lingo
fileioObjRef.readLine()
fileioObjRef.readLine();
```

### Description
Fileio method; Reads the next line of a file, including the next RETURN, and returns it as a
string.
You must first open a file by calling openFile() before using readLine() to read a line.

### Parameters
None.

### Example
```lingo

```

### See also
Fileio, openFile()

### Implementation
- **File**: `apps/client/src/director/api/readLine.js`
- **Test**: `apps/client/src/director/api/__tests__/readLine.test.js`
- **Dependencies**: Various (depends on function)

