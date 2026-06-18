## selection() (function)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26969-26988

### Usage
```lingo

```

### Description
Function; returns a string containing the highlighted portion of the current editable field. This
function is useful for testing what a user has selected in a field.
The selection function only indicates which string of characters is selected; you cannot use
selection to select a string of characters.

### Parameters
None.

### Example
```lingo
This statement checks whether any characters are selected and, if none are, displays the alert
“Please select a word.”:
if the selection = EMPTY then alert "Please select a word."
```

### See also
selStart, selEnd

### Implementation
- **File**: `apps/client/src/director/api/selection-function.js`
- **Test**: `apps/client/src/director/api/__tests__/selection-function.test.js`
- **Dependencies**: Various (depends on function)

