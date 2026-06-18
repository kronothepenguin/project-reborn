## linePosToLocV()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19878-19903

### Usage
```lingo
memberObjRef.linePosToLocV(lineNumber)
memberObjRef.linePosToLocV(lineNumber);
```

### Description
Function; returns a specific line’s distance, in pixels, from the top edge of the field cast member.

### Parameters
lineNumber Required. An integer that specifies the line to measure.

382

Chapter 12: Methods

### Example
```lingo
This statement measures the distance, in pixels, from the second line of the field cast member
Today’s News to the top of the field cast member and assigns the result to the variable
startOfString:
--Lingo syntax
startOfString = member("Today's News").linePosToLocV(2)
// JavaScript syntax
var startOfString = member("Today's News").linePosToLocV(2);
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/linePosToLocV.js`
- **Test**: `apps/client/src/director/api/__tests__/linePosToLocV.test.js`
- **Dependencies**: Various (depends on function)

