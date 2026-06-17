## lineHeight()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19858-19877

### Usage
```lingo
memberObjRef.lineHeight(lineNumber)
memberObjRef.lineHeight(lineNumber);
```

### Description
Function; returns the height, in pixels, of a specific line in a specified field cast member.

### Parameters
lineNumber Required. An integer that specifies the line to measure.

### Example
```lingo
This statement determines the height, in pixels, of the first line in the field cast member Today’s
News and assigns the result to the variable headline:
--Lingo syntax
headline = member("Today's News").lineHeight(1)
// JavaScript syntax
var headline = member("Today's News").lineHeight(1);
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/lineHeight.js`
- **Test**: `apps/client/src/director/api/__tests__/lineHeight.test.js`
- **Dependencies**: Various (depends on function)

