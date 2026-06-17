## locVToLinePos()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20054-20079

### Usage
```lingo
memberObjRef.locVToLinePos(locV)
memberObjRef.locVToLinePos(locV);
```

### Description
Function; returns the number of the line of characters that appears at a specified vertical position.

### Parameters
locV Required. Specifies the vertical position of the line of characters. This value is the number of
pixels from the top of the field cast member, not the part of the field cast member that currently
appears on the Stage.

### Example
```lingo
This statement determines which line of characters appears 150 pixels from the top of the field
cast member Today’s News and assigns the result to the variable pageBreak:
--Lingo syntax
pageBreak = member("Today's News").locVToLinePos(150)
// JavaScript syntax
var pageBreak = member("Today's News").locVToLinePos(150);

386

Chapter 12: Methods
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/locVToLinePos.js`
- **Test**: `apps/client/src/director/api/__tests__/locVToLinePos.test.js`
- **Dependencies**: Various (depends on function)

