## getVariable()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17873-17926

### Usage
```lingo
spriteObjRef.getVariable(variableName {, returnValueOrReference})
spriteObjRef.getVariable(variableName {, returnValueOrReference});
```

### Description
Function; returns the current value of the given variable from the specified Flash sprite. Flash
variables were introduced in Flash version 4.
This function can be used in two ways.
Setting the optional returnValueOrReference parameter to TRUE (the default) returns the
current value of the variable as a string. Setting the returnValueOrReference parameter to
FALSE returns the current literal value of the Flash variable.
If the value of the Flash variable is an object reference, you must set the
returnValueOrReference parameter to FALSE in order for the returned value to have meaning

as an object reference. If it is returned as a string, the string will not be a valid object reference.

### Parameters
variableName Required. Specifies the name of the variable whose value is returned.
returnValueOrReference Optional. Specifies whether the returned value is a string (TRUE) or as

an object reference (FALSE).

### Example
```lingo
This statement sets the variable tValue to the string value of the Flash variable named gOtherVar
in the Flash movie in sprite 3:
-- Lingo syntax
tValue = sprite(3).getVariable("gOtherVar", TRUE)
put(tValue) -- "5"
// JavaScript syntax
var tValue = sprite(3).getVariable("gOtherVar", true);
trace(tValue); // 5

346

Chapter 12: Methods

This statement sets the variable tObject to refer to the same object that the variable named gVar
refers to in the Flash movie in sprite 3:
-- Lingo syntax
tObject = sprite(3).getVariable("gVar",FALSE)
// JavaScript syntax
var tObject = sprite(3).getVariable("gVar",0);

This statement returns the value of the variable currentURL from the Flash cast member in sprite
3 and displays it in the Message window:
-- Lingo syntax
put(sprite(3).getVariable("currentURL"))
// JavaScript syntax
trace(sprite(3).getVariable("currentURL"));
```

### See also
setVariable()

### Implementation
- **File**: `apps/client/src/director/api/getVariable.js`
- **Test**: `apps/client/src/director/api/__tests__/getVariable.test.js`
- **Dependencies**: Various (depends on function)

