## readChar()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25446-25461

### Usage
```lingo
fileioObjRef.readChar()
fileioObjRef.readChar();
```

### Description
Fileio method; Reads the next character of a file and returns it as an ASCII code value.
You must first open a file by calling openFile() before using readChar() to read a character.

### Parameters
None.

### Example
```lingo

```

### See also
Fileio, openFile()

### Implementation
- **File**: `apps/client/src/director/api/readChar.js`
- **Test**: `apps/client/src/director/api/__tests__/readChar.test.js`
- **Dependencies**: Various (depends on function)

