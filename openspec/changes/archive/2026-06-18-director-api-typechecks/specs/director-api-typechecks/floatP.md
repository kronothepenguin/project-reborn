## floatP()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16417-16446

### Usage
```lingo

```

### Description
Function (Lingo only); indicates whether an expression is a floating-point number (1 or TRUE) or
not (0 or FALSE).
The P in floatP stands for predicate.

### Parameters
expression Required. The expression to test.

floatP()

317

### Example
```lingo
This statement tests whether 3.0 is a floating-point number. The Message window displays the
number 1, indicating that the statement is TRUE.
put (3.0).floatP
-- 1

This statement tests whether 3 is a floating-point number. The Message window displays the
number 0, indicating that the statement is FALSE.
put (3).floatP
-- 0
```

### See also
float(), ilk(), integerP(), objectP(), stringP(), symbolP()

### Implementation
- **File**: `apps/client/src/director/api/floatP.js`
- **Test**: `apps/client/src/director/api/__tests__/floatP.test.js`
- **Dependencies**: None (pure function)

