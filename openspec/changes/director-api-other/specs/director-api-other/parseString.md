## parseString()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 22719-22743

### Usage
```lingo

```

### Description
Function; used to parse an XML document that is already fully available to the Director movie.
The first parameter is the variable containing the parser object. The return value is <VOID> if the
operation succeeds, or an error code number string if it fails. Failure is usually due to a problem
with the XML syntax or structure. Once the operation is complete, the parser object contains the
parsed XML data.
To parse XML at a URL, use parseURL().

### Parameters
stringToParse Required. Specifies the string of XML data to parse.

### Example
```lingo
This statement parses the XML data in the text cast member XMLtext. Once the operation is
complete, the variable gParserObject will contain the parsed XML data.
errorCode = gParserObject.parseString(member("XMLtext"))
```

### See also
getError() (XML), parseURL()

parseString()

439

### Implementation
- **File**: `apps/client/src/director/api/parseString.js`
- **Test**: `apps/client/src/director/api/__tests__/parseString.test.js`
- **Dependencies**: Various (depends on function)

