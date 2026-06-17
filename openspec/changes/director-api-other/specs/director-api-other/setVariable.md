## setVariable()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27763-27792

### Usage
```lingo
spriteObjRef.setVariable(variableName, newValue)
spriteObjRef.setVariable(variableName, newValue);
```

### Description
Function; sets the value of the given variable in the given Flash sprite. Flash variables were
introduced in Flash version 4.

### Parameters
variableName Required. Specifies the name of the variable.
newValue Required. Specifies the new value of the variable.

### Example
```lingo
The following statement sets the value of the variable currentURL in the Flash cast member in
sprite 3. The new value of currentURL will be “http://www.macromedia.com/software/flash/”.
-- Lingo syntax
sprite(3).setVariable("currentURL", \
"http://www.macromedia.com/software/flash/")
// JavaScript syntax
sprite(3).setVariable("currentURL",
"http://www.macromedia.com/software/flash/");
```

### See also
hitTest(), getVariable()

setVariable()

539

### Implementation
- **File**: `apps/client/src/director/api/setVariable.js`
- **Test**: `apps/client/src/director/api/__tests__/setVariable.test.js`
- **Dependencies**: Various (depends on function)

