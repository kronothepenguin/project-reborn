## error()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 15659-15678

### Usage
```lingo
fileioObjRef.error(intError)
fileioObjRef.error(intError);
```

### Description
Fileio method; Returns a specified error message.

### Parameters
intError Required. An integer that specifies the error. Valid values include 0 ("OK") or 1

("Memory allocation failure"). All other values return "Unknown error".

### Example
```lingo

```

### See also
Fileio

error()

303

### Implementation
- **File**: `apps/client/src/director/api/error.js`
- **Test**: `apps/client/src/director/api/__tests__/error.test.js`
- **Dependencies**: Various (depends on function)

