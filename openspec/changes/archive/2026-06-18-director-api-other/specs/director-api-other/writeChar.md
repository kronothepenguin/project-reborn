## writeChar()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 30256-30274

### Usage
```lingo
fileioObjRef.writeChar(stringChar)
fileioObjRef.writeChar(stringChar)
```

### Description
Fileio method; Writes a single specified ASCII character to a file.
You must first open a file by calling openFile() before using writeChar() to write a character.

### Parameters
stringChar Required. Specifies the ASCII character to write to the file.

### Example
```lingo

```

### See also
Fileio

writeChar()

591

### Implementation
- **File**: `apps/client/src/director/api/writeChar.js`
- **Test**: `apps/client/src/director/api/__tests__/writeChar.test.js`
- **Dependencies**: Various (depends on function)

