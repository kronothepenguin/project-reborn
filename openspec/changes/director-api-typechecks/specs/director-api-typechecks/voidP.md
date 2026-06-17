## voidP()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 30146-30168

### Usage
```lingo
voidP(variableName)
variableName == null
```

### Description
Function; determines whether a specified variable has any value. If the variable has no value or
is VOID, this function returns TRUE. If the variable has a value other than VOID, this function
returns FALSE.

### Parameters
variableName Required. Specifies the variable to test.

### Example
```lingo
This statement checks whether the variable answer has an initial value:
-- Lingo syntax
put voidP(answer)
// JavaScript syntax
put(answer == null));
```

### See also
ilk(), VOID

### Implementation
- **File**: `apps/client/src/director/api/voidP.js`
- **Test**: `apps/client/src/director/api/__tests__/voidP.test.js`
- **Dependencies**: None (pure function)

