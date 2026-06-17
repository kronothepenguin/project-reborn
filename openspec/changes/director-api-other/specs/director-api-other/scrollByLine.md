## scrollByLine()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26784-26814

### Usage
```lingo
memberObjRef.scrollByLine(amount)
memberObjRef.scrollByLine(amount);
```

### Description
Command; scrolls the specified field or text cast member up or down by a specified number of
lines. Lines are defined as lines separated by carriage returns or by wrapping.

### Parameters
amount Required. Specifies the number of lines to scroll. When amount is positive, the field
scrolls down. When amount is negative, the field scrolls up.

### Example
```lingo
This statement scrolls the field cast member Today’s News down five lines:
--Lingo syntax
member("Today's News").scrollbyline(5)
// JavaScript syntax
member("Today's News").scrollbyline(5);

This statement scrolls the field cast member Today’s News up five lines:
--Lingo syntax
member("Today’s News").scrollByLine(-5)
// JavaScript syntax
member("Today’s News").scrollByLine(-5);

scrollByLine()

519
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/scrollByLine.js`
- **Test**: `apps/client/src/director/api/__tests__/scrollByLine.test.js`
- **Dependencies**: Various (depends on function)

