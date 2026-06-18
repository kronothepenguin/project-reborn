## parseURL()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 22744-22866

### Usage
```lingo

```

### Description
Function; parses an XML document that resides at an external Internet location. The first
parameter is the parser object containing an instance of the XML Parser Xtra.
This function returns immediately, so the entire URL may not yet be parsed. It is important to
use the doneParsing() function in conjunction with parseURL() to determine when the
parsing operation is complete.
Since this operation is asynchronous, meaning it may take some time, you can use optional
parameters to call a specific handler when the operation completes.
The return value is void if the operation succeeds, or an error code number string if it fails.
To parse XML locally, use parseString().

### Parameters
URLstring Required. Specifies the actual URL at which the XML data resides.
handlerToCallOnCompletion Optional. Specifies the name of the handler that is to be executed

once the URL is fully parsed.
objectContainingHandler Optional. Specifies the name of the script object containing the
handler handlerToCallOnCompletion. If omitted, the handler is assumed to be a movie handler.

### Example
```lingo
This statement parses the file sample.xml at MyCompany.com. Use doneParsing() to determine
when the parsing operation has completed.
--Lingo syntax
errorCode = gParserObject.parseURL("http://www.MyCompany.com/sample.xml")
// JavaScript syntax
errorCode = _global.gParserObject.parseURL("http://- www.MyCompany.com/
sample.xml");
Note: This example supposes that an instance of the Xtra has already been created, and a reference
to that has been stored in the global variable named gParserObject.

This Lingo parses the file sample.xml and calls the on parseDone handler. Because no script
object is given with the doneParsing() function, the on parseDone handler is assumed to be in
a movie script.
errorCode = gParserObject.parseURL("http://www.MyCompany.com/sample.xml",
#parseDone)

440

Chapter 12: Methods

The movie script contains the on parseDone handler:
on parseDone
global gParserObject
if voidP(gParserObject.getError()) then
put "Successful parse"
else
put "Parse error:"
put "
" & gParserObject.getError()
end if
end

This JavaScript syntax parses the file sample.xml and calls the parseDone function. Because no
script object is given with the doneParsing() function, the parseDone function is assumed to be
in a movie script.
errorCode = _global.gParserObject.parseURL("http://- www.MyCompany.com/
sample.xml", symbol("parseDone"));
Note: This example supposes that an instance of the Xtra has already been created, and a reference
to that has been stored in the global variable named gParserObject.

The movie script contains the on parseDone handler:
// JavaScript syntax
function parseDone () {
if (_global.gParserObject.getError() == undefined) {
trace("successful parse");
} else {
trace("Parse error:");
trace(" " + _global.gParserObject.getError());
}
}

This Lingo parses the document sample.xml at MyCompany.com and calls the on parseDone
handler in the script object testObject, which is a child of the parent script TestScript:
parserObject = new(xtra "XMLParser")
testObject = new(script "TestScript", parserObject)
errorCode = gParserObject.parseURL("http://www.MyCompany.com/sample.xml",
#parseDone, testObject)

Here is the parent script TestScript:
property myParserObject
on new me, parserObject
myParserObject = parserObject
end
on parseDone me
if voidP(myParserObject.getError()) then
put "Successful parse"
else
put "Parse error:"
put "
" & myParserObject.getError()
end if
end

parseURL()

441

This JavaScript syntax parses the document sample.xml at MyCompany.com and calls the
parseDone function in the object testObject, which is an instance of the defined TestScript class:
parserObject = new xtra("XMLParser");
testObject = new TestScript(parserObject);
errorCode = parserObject .parseURL("http://www.MyCompany.com/sam- ple.xml",
symbol("parseDone"), testObject)

Here is the TestScript class definition:
TestScript = function (aParser) {
this.myParserObject = aParser;
}
TestScript.prototype.parseDone = function () {
if (this.myParserObject.getError() == undefined) {
trace("successful parse");
} else {
trace("Parse error:");
trace(" " + this.myParserObject.getError());
}
}
```

### See also
getError() (XML), parseString()

### Implementation
- **File**: `apps/client/src/director/api/parseURL.js`
- **Test**: `apps/client/src/director/api/__tests__/parseURL.test.js`
- **Dependencies**: Various (depends on function)

