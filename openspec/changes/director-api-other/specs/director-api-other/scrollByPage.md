## scrollByPage()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26815-26843

### Usage
```lingo
memberObjRef.scrollByPage(amount)
memberObjRef.scrollByPage(amount);
```

### Description
Command; scrolls the specified field or text cast member up or down by a specified number of
pages. A page is equal to the number of lines of text visible on the screen.

### Parameters
amount Required. Specifies the number of pages to scroll. When amount is positive, the field
scrolls down. When amount is negative, the field scrolls up.

### Example
```lingo
This statement scrolls the field cast member Today’s News down one page:
--Lingo syntax
member("Today's News").scrollbypage(1)
// JavaScript syntax
member("Today's News").scrollbypage(1);

This statement scrolls the field cast member Today’s News up one page:
--Lingo syntax
member("Today's News").scrollbypage(-1)
// JavaScript syntax
member("Today's News").scrollbypage(-1);
```

### See also
scrollTop

### Implementation
- **File**: `apps/client/src/director/api/scrollByPage.js`
- **Test**: `apps/client/src/director/api/__tests__/scrollByPage.test.js`
- **Dependencies**: Various (depends on function)

