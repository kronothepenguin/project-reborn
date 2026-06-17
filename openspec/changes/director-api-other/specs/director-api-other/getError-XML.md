## getError() (XML)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16993-17016

### Usage
```lingo

```

### Description
Function; returns the descriptive error string associated with a given error number (including the
line and column number of the XML where the error occurred). When there is no error, this
function returns <VOID>.

### Parameters
None.

### Example
```lingo
These statements check an error after parsing a string containing XML data:
errCode = parserObj.parseString(member("XMLtext").text)
errorString = parserObj.getError()
if voidP(errorString) then
-- Go ahead and use the XML in some way
else
alert "Sorry, there was an error " & errorString
-- Exit from the handler
exit
end if
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/getError-XML.js`
- **Test**: `apps/client/src/director/api/__tests__/getError-XML.test.js`
- **Dependencies**: Various (depends on function)

