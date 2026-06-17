## makeList()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20101-20150

### Usage
```lingo
parserObject.makeList()
parserObject.makeList();
```

### Description
Function; returns a property list based on the XML document parsed using parseString()
or parseURL().

### Parameters
None.

### Example
```lingo
This handler parses of an XML document and returns the resulting list:
-- Lingo syntax
on ConvertToList xmlString
parserObject = new(xtra "xmlparser")
errorCode = parserObj.parseString(xmlString)
errorString = parserObj.getError()
if voidP(errorString) then
parsedList = parserObj.makeList()
else
alert "Sorry, there was an error" && errorString
exit

makeList()

387

end if
return parsedList
end
// JavaScript syntax
function ConvertToList(xmlString) {
parserObject = new Xtra("xmlparser"); // check syntax
errorCode = parserObject.parseString(xmlString);
errorString = parserObject.getError();
if (voidP(errorString)) {
parsedList = parserObject.makeList();
} else {
alert("Sorry, there was an error" + errorString);
return false;
}
return parsedList;
}
```

### See also
makeSubList()

### Implementation
- **File**: `apps/client/src/director/api/makeList.js`
- **Test**: `apps/client/src/director/api/__tests__/makeList.test.js`
- **Dependencies**: Various (depends on function)

