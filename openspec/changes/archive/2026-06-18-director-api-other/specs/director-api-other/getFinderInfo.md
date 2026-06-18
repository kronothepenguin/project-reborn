## getFinderInfo()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17083-17104

### Usage
```lingo
fileioObjRef.getFinderInfo()
fileioObjRef.getFinderInfo();
```

### Description
Fileio method (Macintosh only); Returns the finder information for an open file.
You must first open a file by calling openFile() before using getFinderInfo() to return the
file’s finder information.

330

Chapter 12: Methods

### Parameters
None.

### Example
```lingo

```

### See also
Fileio, openFile()

### Implementation
- **File**: `apps/client/src/director/api/getFinderInfo.js`
- **Test**: `apps/client/src/director/api/__tests__/getFinderInfo.test.js`
- **Dependencies**: Various (depends on function)

