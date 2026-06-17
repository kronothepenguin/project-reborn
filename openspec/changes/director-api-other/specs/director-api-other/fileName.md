## fileName()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16125-16146

### Usage
```lingo
fileioObjRef.fileName()
fileioObjRef.fileName();
```

### Description
Fileio method; Returns the full path and name of an open file.
You must first open a file by calling openFile() before using fileName() to return the
file’s name.

fileName()

311

### Parameters
None.

### Example
```lingo

```

### See also
Fileio , openFile()

### Implementation
- **File**: `apps/client/src/director/api/fileName.js`
- **Test**: `apps/client/src/director/api/__tests__/fileName.test.js`
- **Dependencies**: Various (depends on function)

