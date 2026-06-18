## length()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19802-19831

### Usage
```lingo

```

### Description
Function; returns the number of characters in the string specified by string, including spaces
and control characters such as TAB and RETURN.

### Parameters
None.

### Example
```lingo
This statement displays the number of characters in the string “Macro”&“media”:
put ("Macro" & "media").length
-- 10

This statement checks whether the content of the field cast member Filename has more than 31
characters and if it does, displays an alert:
-- Lingo syntax
if member("Filename").text.length > 31 then
alert "That filename is too long."
end if
// JavaScript syntax
if (member("Filename").text.length > 31) {
alert("That filename is too long.");
}
```

### See also
chars(), offset() (string function)

### Implementation
- **File**: `apps/client/src/director/api/length.js`
- **Test**: `apps/client/src/director/api/__tests__/length.test.js`
- **Dependencies**: Various (depends on function)

