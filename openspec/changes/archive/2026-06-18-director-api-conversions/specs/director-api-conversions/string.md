## string()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28533-28555

### Usage
```lingo

```

### Description
Function; converts an integer, floating-point number, object reference, list, symbol, or other
nonstring expression to a string.

### Parameters
expression Required. The expression to convert to a string.

### Example
```lingo
This statement adds 2.0 + 2.5 and inserts the results in the field cast member Total:
member("total").text = string(2.0 + 2.5)

This statement converts the symbol #red to a string and inserts it in the field cast member Color:
member("Color").text = string(#red)
```

### See also
value(), stringP(), float(), integer(), symbol()

string()

555

### Implementation
- **File**: `apps/client/src/director/api/string.js`
- **Test**: `apps/client/src/director/api/__tests__/string.test.js`
- **Dependencies**: None (pure function)

