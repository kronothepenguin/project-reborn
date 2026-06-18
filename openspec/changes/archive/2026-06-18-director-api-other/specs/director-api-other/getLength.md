## getLength()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17291-17307

### Usage
```lingo
fileioObjRef.getLength()
fileioObjRef.getLength();
```

### Description
Fileio method; Returns the length of an open file.
You must first open a file by calling openFile() before using getLength() to return the length
of the file.

### Parameters
None.

### Example
```lingo

```

### See also
Fileio, openFile()

### Implementation
- **File**: `apps/client/src/director/api/getLength.js`
- **Test**: `apps/client/src/director/api/__tests__/getLength.test.js`
- **Dependencies**: Various (depends on function)

