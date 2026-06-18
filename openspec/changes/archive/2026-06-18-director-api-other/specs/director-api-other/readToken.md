## readToken()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25501-25522

### Usage
```lingo
fileioObjRef.readToken(stringSkip, stringBreak)
fileioObjRef.readToken(stringSkip, stringBreak);
```

### Description
Fileio method; Reads the next token and returns it as a string.
You must first open a file by calling openFile() before using readToken() to read a token.

### Parameters
stringSkip Required. A string that specifies the set of characters after which the token starts.
The string stringSkip is not included in the returned string.
stringBreak Required. A string that specifies the set of characters before which the token ends.
The string stringBreak is not included in the returned string.

### Example
```lingo

```

### See also
Fileio, openFile()

readToken()

493

### Implementation
- **File**: `apps/client/src/director/api/readToken.js`
- **Test**: `apps/client/src/director/api/__tests__/readToken.test.js`
- **Dependencies**: Various (depends on function)

